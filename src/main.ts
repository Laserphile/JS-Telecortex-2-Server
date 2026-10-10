import { loadConfig, USAGE } from "./config";
import { forEachOpcMessage } from "./opc";
import { PanelOutput } from "./output";
import { brightnessByte } from "./sk9822";
import { discardWrite, openSpidev } from "./spi";

const STATS_INTERVAL_MS = 10_000;

const args = Bun.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(USAGE);
  process.exit(0);
}

const config = loadConfig(args, process.env);
console.log("config:", JSON.stringify({ ...config, spiChannels: Object.fromEntries(config.spiChannels) }));

const hasSpi = process.platform === "linux";
if (!hasSpi) console.warn("Not on Linux, so SPI output is discarded");

const brightness = brightnessByte(config.brightness);
const outputs = new Array<PanelOutput | undefined>(256);
for (const [channel, { bus, device }] of config.spiChannels) {
  const path = `/dev/spidev${bus}.${device}`;
  const write = hasSpi ? openSpidev(path, config.spiMode, config.spiClockSpeed) : discardWrite;
  outputs[channel] = new PanelOutput(`ch${channel}`, write, brightness);
}

let unknownChannel = 0;
const onPixels = (channel: number, rgb: Uint8Array) => {
  const output = outputs[channel];
  if (output) output.send(rgb);
  else unknownChannel += 1;
};

const socket = await Bun.udpSocket({
  hostname: "0.0.0.0",
  port: config.port,
  socket: { data: (_socket, data) => forEachOpcMessage(data, onPixels) },
});
console.log(`Listening for OPC on udp://${socket.hostname}:${socket.port}`);

// In a container this is PID 1, which gets no default signal handling, so without these
// Docker waits 10 seconds and then kills it on every restart
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    socket.close();
    process.exit(0);
  });
}

// Log frame rates while frames are arriving
setInterval(() => {
  const seconds = STATS_INTERVAL_MS / 1000;
  const panels = outputs.flatMap((output) => (output ? [[output.name, output.takeStats()] as const] : []));
  if (!unknownChannel && panels.every(([, stats]) => !stats.received)) return;
  const fps = (count: number) => (count / seconds).toFixed(1);
  const lines = panels.map(
    ([name, { received, written, dropped, errors }]) =>
      `${name} ${fps(received)} in / ${fps(written)} out fps, ${dropped} dropped${errors ? `, ${errors} errors` : ""}`,
  );
  if (unknownChannel) lines.push(`${unknownChannel} messages for unmapped channels`);
  unknownChannel = 0;
  console.log(`last ${seconds}s: ${lines.join(" | ")}`);
}, STATS_INTERVAL_MS);
