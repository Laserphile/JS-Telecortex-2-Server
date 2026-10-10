import { describe, expect, test } from "bun:test";
import { brightnessByte, encodeSk9822, frameLength, GAMMA_TABLE, maxLeds } from "../src/sk9822";

// The old server's encoder (src/protocols/sk9822.js and gamma.js at ba72f89), transcribed as the reference
const oldGammaTable = Array.from({ length: 0x100 }).map((_, i) => Math.floor((i / 255.0) ** 2.8 * 255 + 0.5));
const oldColours2sk9822 = (rgb: Uint8Array, brightness: number) => {
  const out = [0, 0, 0, 0];
  for (let i = 0; i + 2 < rgb.length; i += 3) {
    out.push(
      0xe0 + Math.round(brightness * 0x1f),
      oldGammaTable[rgb[i + 2]] % 0x100,
      oldGammaTable[rgb[i + 1]] % 0x100,
      oldGammaTable[rgb[i]] % 0x100,
    );
  }
  return out;
};

const encode = (rgb: ArrayLike<number>, brightness: number, bufferLength = 4096) => {
  const out = new Uint8Array(bufferLength).fill(0xaa);
  return [...out.subarray(0, encodeSk9822(Uint8Array.from(rgb), brightnessByte(brightness), out))];
};

/** Deterministic pseudo-random bytes, so failures reproduce */
const randomBytes = (length: number, seed: number) =>
  Uint8Array.from({ length }, () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) >> 23);

describe("encodeSk9822", () => {
  test("matches the old server's snapshot for one red LED at its default brightness of 0.5", () => {
    const frame = encode([0xff, 0x00, 0x00], 0.5);
    expect(frame.slice(0, 8)).toEqual([0, 0, 0, 0, 240, 0, 0, 255]);
    expect(frame.slice(8)).toEqual([0, 0, 0, 0, 0]);
  });

  test("uses the old gamma table", () => {
    expect([...GAMMA_TABLE]).toEqual(oldGammaTable);
  });

  for (const leds of [260, 316]) {
    for (const brightness of [0, 0.37, 1]) {
      test(`matches the old encoder for ${leds} LEDs at brightness ${brightness}, then adds zero trailing frames`, () => {
        const rgb = randomBytes(leds * 3, leds + brightness * 100);
        const old = oldColours2sk9822(rgb, brightness);
        const frame = encode(rgb, brightness);
        expect(frame.length).toBe(frameLength(leds));
        expect(frame.slice(0, old.length)).toEqual(old);
        expect(frame.slice(old.length).every((byte) => byte === 0)).toBe(true);
      });
    }
  }

  test("sizes the trailing frames for the panels", () => {
    expect(frameLength(316)).toBe(4 + 316 * 4 + 4 + 20);
    expect(frameLength(260)).toBe(4 + 260 * 4 + 4 + 17);
  });

  test("ignores a partial LED at the end", () => {
    expect(encode([1, 2, 3, 4, 5], 1)).toEqual(encode([1, 2, 3], 1));
  });

  test("drops LEDs that don't fit in one SPI write", () => {
    expect(maxLeds(4096)).toBe(1006);
    expect(frameLength(1006)).toBeLessThanOrEqual(4096);
    expect(frameLength(1007)).toBeGreaterThan(4096);
    const frame = encode(randomBytes(2000 * 3, 1), 1);
    expect(frame.length).toBe(frameLength(1006));
  });
});
