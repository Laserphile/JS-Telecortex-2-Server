import { parseOPCHeader, parseOPCBody } from './parser';
import { PartialOPCMsgError } from './errors';

describe('parseOPCHeader', () => {
  it('handles blank message', () => {
    expect(() => parseOPCHeader()).toThrow(Error);
  });
  it('handles short message', () => {
    expect(() => parseOPCHeader(Buffer.from([0x00, 0x00]))).toThrow(PartialOPCMsgError);
  });
  [
    {
      testName: 'works with all null bytes',
      inArray: [0x00, 0x00, 0x00, 0x00],
      out: { channel: 0, command: 0, length: 0 }
    },
    {
      testName: 'works with a small header',
      inArray: [0x01, 0x00, 0x00, 0x09],
      out: { channel: 1, command: 0, length: 9 }
    },
    {
      testName: 'works with a big header (valid latin-1 bytes)',
      inArray: [0x0a, 0x00, 0x02, 0x01],
      out: { channel: 10, command: 0, length: 513 }
    },
    {
      testName: 'works with a big header (invalid latin-1 bytes)',
      inArray: [0xff, 0x00, 0x01, 0x00],
      out: { channel: 255, command: 0, length: 256 }
    }
  ].forEach(({ testName, inArray, out }) => {
    it(testName, () => {
      expect(parseOPCHeader(Buffer.from(inArray))).toEqual(out);
    });
  });
});

describe('parseOPCBody', () => {
  it('handles blank message', () => {
    expect(() => parseOPCBody()).toThrow(Error);
  });
  it('handles short incomplete message', () => {
    expect(() => parseOPCBody(Buffer.from([0x00, 0x00]))).toThrow(PartialOPCMsgError);
  });
  it('handles medium incomplete message', () => {
    expect(() => parseOPCBody(Buffer.from([0x00, 0x00, 0x00, 0xff, 0x00]), 255)).toThrow(
      PartialOPCMsgError
    );
  });
  it('works with all null bytes', () => {
    expect(parseOPCBody(Buffer.from([0x00, 0x00, 0x00, 0x00]))).toEqual([]);
  });
  it('works with a typical body', () => {
    expect(
      parseOPCBody(
        Buffer.from([0x01, 0x00, 0x00, 0x09, 0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00, 0xff])
      )
    ).toEqual([{ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, { r: 0, g: 0, b: 255 }]);
  });
});
