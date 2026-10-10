import { describe, expect, test } from "bun:test";
import { forEachOpcMessage } from "../src/opc";

const message = (channel: number, body: number[], command = 0) => [
  channel,
  command,
  body.length >> 8,
  body.length & 0xff,
  ...body,
];

const parse = (datagram: number[]) => {
  const calls: [number, number[]][] = [];
  forEachOpcMessage(Uint8Array.from(datagram), (channel, rgb) => calls.push([channel, [...rgb]]));
  return calls;
};

const red = [0xff, 0x00, 0x00];

describe("forEachOpcMessage", () => {
  test("reads one message", () => {
    expect(parse(message(0, red))).toEqual([[0, red]]);
  });

  test("reads several messages from one datagram", () => {
    expect(parse([...message(0, red), ...message(3, [1, 2, 3, 4, 5, 6])])).toEqual([
      [0, red],
      [3, [1, 2, 3, 4, 5, 6]],
    ]);
  });

  test("reads a big-endian length", () => {
    const body = Array.from({ length: 316 * 3 }, (_, i) => i & 0xff);
    const datagram = message(1, body);
    expect(datagram.slice(2, 4)).toEqual([0x03, 0xb4]);
    expect(parse(datagram)).toEqual([[1, body]]);
  });

  test("skips a truncated message at the end", () => {
    expect(parse([...message(0, red), ...message(1, red).slice(0, -1)])).toEqual([[0, red]]);
  });

  test("skips a header with no room for a body", () => {
    expect(parse([...message(0, red), 2, 0])).toEqual([[0, red]]);
  });

  test("skips other commands but keeps reading", () => {
    expect(parse([...message(0, [1, 2, 3, 4], 0xff), ...message(1, red)])).toEqual([[1, red]]);
  });

  test("passes an empty body through", () => {
    expect(parse(message(2, []))).toEqual([[2, []]]);
  });
});
