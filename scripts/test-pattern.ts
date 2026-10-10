/**
 * Sends a test pattern over OPC/UDP, to check panels without Chromatik:
 *
 *   bun scripts/test-pattern.ts --host red-mountain.local --channels 0 --fps 60
 *
 * By default a dim rainbow scrolls along each panel. --colour 255,0,0 sends solid red instead, and
 * --colour 255,0,0/0,255,0/0,0,255 cycles red, green and blue, holding each for --hold seconds, which checks the
 * colour order. The server logs the frame rates it receives and writes, so a high --fps shows what SPI keeps up with.
 */
import { lookup } from "node:dns/promises";
import { parseArgs } from "node:util";
import { OPC_HEADER_LENGTH } from "../src/opc";

const { values } = parseArgs({
  options: {
    host: { type: "string", default: "127.0.0.1" },
    port: { type: "string", default: "42069" },
    channels: { type: "string", default: "0,1,2,3" },
    leds: { type: "string", default: "316" },
    fps: { type: "string", default: "60" },
    seconds: { type: "string", default: "10" },
    // The brightest any colour gets. Full white on 316 LEDs draws far more current than a small supply gives.
    level: { type: "string", default: "64" },
    colour: { type: "string" },
    hold: { type: "string", default: "3" },
  },
});

const port = Number(values.port);
const channels = values.channels.split(",").map(Number);
const leds = Number(values.leds);
const fps = Number(values.fps);
const level = Number(values.level);
const totalFrames = Math.round(fps * Number(values.seconds));
const colours = values.colour
  ?.split("/")
  .map((colour) => colour.split(",").map((value) => Math.min(Number(value), level)));
const holdFrames = Math.max(1, Math.round(fps * Number(values.hold)));
const { address } = await lookup(values.host, { family: 4 });

const rainbow = (position: number): number[] => {
  const h = (position % 1) * 6;
  const x = 1 - Math.abs((h % 2) - 1);
  const rgb = h < 1 ? [1, x, 0] : h < 2 ? [x, 1, 0] : h < 3 ? [0, 1, x] : h < 4 ? [0, x, 1] : h < 5 ? [x, 0, 1] : [1, 0, x];
  return rgb.map((value) => Math.round(value * level));
};

const message = new Uint8Array(OPC_HEADER_LENGTH + leds * 3);
message[2] = (leds * 3) >> 8;
message[3] = (leds * 3) & 0xff;

const socket = await Bun.udpSocket({});
console.log(`Sending ${totalFrames} frames to ${address}:${port}, channels ${channels.join(",")}, ${leds} LEDs, ${fps} fps`);

let frame = 0;
const start = performance.now();
const timer = setInterval(() => {
  const solid = colours?.[Math.floor(frame / holdFrames) % colours.length];
  for (let led = 0; led < leds; led++) {
    message.set(solid ?? rainbow((led + frame) / leds), OPC_HEADER_LENGTH + led * 3);
  }
  for (const channel of channels) {
    message[0] = channel;
    socket.send(message, port, address);
  }
  frame += 1;
  if (frame >= totalFrames) {
    clearInterval(timer);
    const seconds = (performance.now() - start) / 1000;
    console.log(`Sent ${frame} frames in ${seconds.toFixed(1)}s (${(frame / seconds).toFixed(1)} fps)`);
    socket.close();
  }
}, 1000 / fps);
