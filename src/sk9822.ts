/**
 * SK9822 / APA102 framing.
 *
 * A frame is a 32-bit zero start frame, then 4 bytes per LED (0b111 + 5-bit global brightness, blue, green, red),
 * then a 32-bit zero reset frame and an end frame of at least one clock edge per two LEDs.
 * SK9822s only show new colours after the reset frame, and each LED delays the data by half a clock,
 * so without the trailing frames a panel shows each frame only when the next one arrives.
 * See https://cpldcpu.com/2016/12/13/sk9822-a-clone-of-the-apa102/
 * The old server sent no trailing frames; the start frame and LED bytes are identical to its output.
 */
const START_FRAME_LENGTH = 4;
const RESET_FRAME_LENGTH = 4;
const BYTES_PER_LED = 4;
const BRIGHTNESS_PREFIX = 0xe0;
const BRIGHTNESS_MAX = 0x1f;
const GAMMA = 2.8;

/** Same curve as the old server: floor((i / 255) ** 2.8 * 255 + 0.5) */
export const GAMMA_TABLE = Uint8Array.from({ length: 256 }, (_, i) => Math.floor((i / 255) ** GAMMA * 255 + 0.5));

/** The first byte of every LED frame, for a global brightness from 0 to 1 */
export const brightnessByte = (brightness: number): number =>
  BRIGHTNESS_PREFIX + Math.round(brightness * BRIGHTNESS_MAX);

const endFrameLength = (leds: number) => RESET_FRAME_LENGTH + Math.ceil(leds / 16);

export const frameLength = (leds: number): number => START_FRAME_LENGTH + leds * BYTES_PER_LED + endFrameLength(leds);

/** The most LEDs whose frame fits in a buffer of the given size */
export const maxLeds = (bufferLength: number): number => {
  let leds = Math.floor((bufferLength - START_FRAME_LENGTH - RESET_FRAME_LENGTH) / BYTES_PER_LED);
  while (leds > 0 && frameLength(leds) > bufferLength) leds -= 1;
  return Math.max(leds, 0);
};

/**
 * Encodes RGB triplets as an SK9822 frame into out, dropping LEDs that don't fit.
 * @param brightness from brightnessByte()
 * @return the frame length in bytes
 */
export function encodeSk9822(rgb: Uint8Array, brightness: number, out: Uint8Array): number {
  let leds = Math.floor(rgb.length / 3);
  if (frameLength(leds) > out.length) leds = maxLeds(out.length);
  out.fill(0, 0, START_FRAME_LENGTH);
  let o = START_FRAME_LENGTH;
  for (let i = 0, end = leds * 3; i < end; i += 3) {
    out[o] = brightness;
    out[o + 1] = GAMMA_TABLE[rgb[i + 2]];
    out[o + 2] = GAMMA_TABLE[rgb[i + 1]];
    out[o + 3] = GAMMA_TABLE[rgb[i]];
    o += BYTES_PER_LED;
  }
  const length = o + endFrameLength(leds);
  out.fill(0, o, length);
  return length;
}
