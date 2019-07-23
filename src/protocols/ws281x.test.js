import { rgb2ws2811, rgb2ws2812, toWs281x3BitSymbols, pack3BitSymbols } from './ws281x';
require('../testing/setupTests.js');

describe('rgb2ws2811', () => {
  it('works', () => {
    expect(rgb2ws2811({ r: 255, g: 15, b: 0 }, 1)).toBeCloseToBytes([
      /* blue */
      0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100,
      /* green */
      0b100, 0b100, 0b100, 0b100, 0b110, 0b110, 0b110, 0b110,
      /* red */
      0b110, 0b110, 0b110, 0b110, 0b110, 0b110, 0b110, 0b110,
    ])
  })
  it('accepts and uses brightness', () => {
    expect(rgb2ws2811({ r: 128, g: 64, b: 0 }, 0.5)).toBeCloseToBytes([
      /* blue */
      0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100,
      /* green */
      0b100, 0b100, 0b110, 0b100, 0b100, 0b100, 0b100, 0b100,
      /* red */
      0b100, 0b110, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100,
    ])
  })
})
describe('rgb2ws2812', () => {
  it('works', () => {
    expect(rgb2ws2812({ r: 255, g: 15, b: 0 }, 1)).toBeCloseToBytes([
      /* blue */
      0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100,
      /* green */
      0b100, 0b100, 0b100, 0b100, 0b110, 0b110, 0b110, 0b110,
      /* red */
      0b110, 0b110, 0b110, 0b110, 0b110, 0b110, 0b110, 0b110,
    ])
  })
  it('accepts and uses brightness', () => {
    expect(rgb2ws2812({ r: 128, g: 64, b: 0 }, 0.5)).toBeCloseToBytes([
      /* blue */
      0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100,
      /* green */
      0b100, 0b100, 0b110, 0b100, 0b100, 0b100, 0b100, 0b100,
      /* red */
      0b100, 0b110, 0b100, 0b100, 0b100, 0b100, 0b100, 0b100,
    ])
  })
})

describe('toWs281x3BitSymbols', () => {
  it('works', () => {
    expect(toWs281x3BitSymbols(15)).toBeCloseToBytes([
      0b100, 0b100, 0b100, 0b100, 0b110, 0b110, 0b110, 0b110
    ])
  })
})

describe('cat3BitSymbols', () => {
  it('works', () => {
    expect(pack3BitSymbols([
      0b000, 0b110, 0b100, 0b110
    ])).toBeCloseToBytes([
      0b00011010, 0b01100000
    ])
  })
  it('handles symbols which fall between bytes', () => {
    expect(pack3BitSymbols([
      0b000, 0b110, 0b101, 0b110
    ])).toBeCloseToBytes([
      0b00011010, 0b11100000
    ])
  })
  it('handles weird symbol array lengths', () => {
    expect(pack3BitSymbols([
      0b000, 0b110, 0b101, 0b110, 0b110, 0b101
    ])).toBeCloseToBytes([
      0b00011010, 0b11101101, 0b01000000
    ])
  })
})
