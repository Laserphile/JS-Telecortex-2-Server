import { describe, expect, test } from "bun:test";
import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  test("defaults to the old server's settings", () => {
    expect(loadConfig([], {})).toEqual({
      port: 42069,
      brightness: 1,
      spiClockSpeed: 3_000_000,
      spiMode: 0,
      spiChannels: new Map([
        [0, { bus: 0, device: 0 }],
        [1, { bus: 0, device: 1 }],
        [2, { bus: 1, device: 0 }],
        [3, { bus: 1, device: 1 }],
      ]),
    });
  });

  test("reads the old server's TELECORTEX_* variables", () => {
    const config = loadConfig([], {
      TELECORTEX_PORT: "1234",
      TELECORTEX_BRIGHTNESS: "0.5",
      TELECORTEX_SPI_CLOCK_SPEED: "8e6",
      TELECORTEX_SPI_MODE: "3",
      TELECORTEX_SPI_CHANNELS: '{"7": {"bus": 1, "device": 1}}',
    });
    expect(config).toEqual({
      port: 1234,
      brightness: 0.5,
      spiClockSpeed: 8_000_000,
      spiMode: 3,
      spiChannels: new Map([[7, { bus: 1, device: 1 }]]),
    });
  });

  test("prefers flags to variables", () => {
    const config = loadConfig(["-p", "5000", "--brightness", "0.25"], { TELECORTEX_PORT: "1234", TELECORTEX_BRIGHTNESS: "1" });
    expect(config.port).toBe(5000);
    expect(config.brightness).toBe(0.25);
  });

  test.each([
    [["--brightness", "2"], "brightness must be a number from 0 to 1, not '2'"],
    [["--port", ""], "port must be a number from 1 to 65535, not ''"],
    [["--spi-mode", "1.5"], "spi-mode must be a whole number, not '1.5'"],
    [["--spi-channels", "{nope"], "spi-channels must be JSON, not '{nope'"],
    [["--spi-channels", "[]"], "spi-channels must be a JSON object, not '[]'"],
    [["--spi-channels", '{"0": {"bus": 0}}'], "spi-channels channel 0 device must be a number from 0 to 9, not 'undefined'"],
  ])("rejects %p", (args, message) => {
    expect(() => loadConfig(args, {})).toThrow(message);
  });

  test("rejects unknown flags", () => {
    expect(() => loadConfig(["--devType", "PBX"], {})).toThrow();
  });
});
