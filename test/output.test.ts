import { describe, expect, test } from "bun:test";
import { PanelOutput, type WriteFn } from "../src/output";
import { brightnessByte, encodeSk9822 } from "../src/sk9822";

/** An SPI device whose writes finish when the test says so */
class FakeSpi {
  writes: { data: Uint8Array; length: number; bytes: number[] }[] = [];
  #pending: ((error: Error | null) => void)[] = [];
  write: WriteFn = (data, length, done) => {
    this.writes.push({ data, length, bytes: [...data.subarray(0, length)] });
    this.#pending.push(done);
  };
  finish(error: Error | null = null) {
    this.#pending.shift()?.(error);
  }
}

const brightness = brightnessByte(1);
const frame = (rgb: number[]) => {
  const out = new Uint8Array(4096);
  return [...out.subarray(0, encodeSk9822(Uint8Array.from(rgb), brightness, out))];
};

describe("PanelOutput", () => {
  test("writes straight away when idle", () => {
    const spi = new FakeSpi();
    new PanelOutput("ch0", spi.write, brightness).send(Uint8Array.of(255, 0, 0));
    expect(spi.writes.map((write) => write.bytes)).toEqual([frame([255, 0, 0])]);
  });

  test("keeps only the newest frame while a write is in flight", () => {
    const spi = new FakeSpi();
    const output = new PanelOutput("ch0", spi.write, brightness);
    output.send(Uint8Array.of(1, 1, 1));
    output.send(Uint8Array.of(2, 2, 2));
    output.send(Uint8Array.of(3, 3, 3));
    expect(spi.writes).toHaveLength(1);
    spi.finish();
    expect(spi.writes.map((write) => write.bytes)).toEqual([frame([1, 1, 1]), frame([3, 3, 3])]);
    spi.finish();
    expect(spi.writes).toHaveLength(2);
    expect(output.takeStats()).toEqual({ received: 3, written: 2, dropped: 1, errors: 0 });
  });

  test("doesn't touch the buffer being written", () => {
    const spi = new FakeSpi();
    const output = new PanelOutput("ch0", spi.write, brightness);
    output.send(Uint8Array.of(255, 255, 255));
    output.send(Uint8Array.of(0, 0, 0));
    const [inFlight] = spi.writes;
    expect([...inFlight.data.subarray(0, inFlight.length)]).toEqual(inFlight.bytes);
  });

  test("counts errors and carries on with the next frame", () => {
    const spi = new FakeSpi();
    const output = new PanelOutput("ch0", spi.write, brightness);
    const error = console.error;
    console.error = () => {};
    try {
      output.send(Uint8Array.of(1, 1, 1));
      output.send(Uint8Array.of(2, 2, 2));
      spi.finish(new Error("EIO"));
    } finally {
      console.error = error;
    }
    expect(spi.writes).toHaveLength(2);
    spi.finish();
    expect(output.takeStats()).toEqual({ received: 2, written: 1, dropped: 0, errors: 1 });
    expect(output.takeStats()).toEqual({ received: 0, written: 0, dropped: 0, errors: 0 });
  });
});
