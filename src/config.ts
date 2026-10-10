import { parseArgs } from "node:util";

export type SpiDevice = { bus: number; device: number };

export type Config = {
  port: number;
  brightness: number;
  spiClockSpeed: number;
  spiMode: number;
  /** OPC channel to spidev */
  spiChannels: Map<number, SpiDevice>;
};

/**
 * Every setting is a command-line flag or a TELECORTEX_* environment variable, so balena variables
 * can change it without a rebuild. A flag beats a variable. The variable names match the old server.
 */
const SETTINGS = {
  port: { env: "TELECORTEX_PORT", default: "42069", help: "UDP port to listen on for OPC" },
  brightness: { env: "TELECORTEX_BRIGHTNESS", default: "1", help: "global brightness, from 0 to 1" },
  "spi-clock-speed": { env: "TELECORTEX_SPI_CLOCK_SPEED", default: "3000000", help: "SPI clock in Hz" },
  "spi-mode": { env: "TELECORTEX_SPI_MODE", default: "0", help: "SPI mode, from 0 to 3" },
  "spi-channels": {
    env: "TELECORTEX_SPI_CHANNELS",
    default: '{"0":{"bus":0,"device":0},"1":{"bus":0,"device":1},"2":{"bus":1,"device":0},"3":{"bus":1,"device":1}}',
    help: "JSON object mapping each OPC channel to an SPI bus and device",
  },
} as const;
type Setting = keyof typeof SETTINGS;

export const USAGE = [
  "Usage: bun src/main.ts [options]",
  "",
  ...Object.entries(SETTINGS).map(
    ([flag, { env, default: value, help }]) => `  --${flag} (${env})\n      ${help}. Default: ${value}`,
  ),
].join("\n");

export function loadConfig(args: string[], env: Record<string, string | undefined>): Config {
  const { values } = parseArgs({
    args,
    options: {
      port: { type: "string", short: "p" },
      brightness: { type: "string", short: "b" },
      "spi-clock-speed": { type: "string" },
      "spi-mode": { type: "string" },
      "spi-channels": { type: "string" },
    },
    strict: true,
  });
  const get = (setting: Setting) => values[setting] ?? env[SETTINGS[setting].env] ?? SETTINGS[setting].default;
  return {
    port: integer(get("port"), "port", 1, 65535),
    brightness: number(get("brightness"), "brightness", 0, 1),
    spiClockSpeed: integer(get("spi-clock-speed"), "spi-clock-speed", 1, 125_000_000),
    spiMode: integer(get("spi-mode"), "spi-mode", 0, 3),
    spiChannels: spiChannels(get("spi-channels")),
  };
}

function number(raw: string, name: string, min: number, max: number): number {
  const value = Number(raw);
  if (raw.trim() === "" || !(value >= min && value <= max)) {
    throw new Error(`${name} must be a number from ${min} to ${max}, not '${raw}'`);
  }
  return value;
}

function integer(raw: string, name: string, min: number, max: number): number {
  const value = number(raw, name, min, max);
  if (!Number.isInteger(value)) throw new Error(`${name} must be a whole number, not '${raw}'`);
  return value;
}

function spiChannels(raw: string): Map<number, SpiDevice> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`spi-channels must be JSON, not '${raw}'`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`spi-channels must be a JSON object, not '${raw}'`);
  }
  return new Map(
    Object.entries(parsed).map(([channel, spi]) => {
      const { bus, device } = (spi ?? {}) as Record<string, unknown>;
      return [
        integer(channel, "spi-channels channel", 0, 255),
        {
          bus: integer(String(bus), `spi-channels channel ${channel} bus`, 0, 9),
          device: integer(String(device), `spi-channels channel ${channel} device`, 0, 9),
        },
      ];
    }),
  );
}
