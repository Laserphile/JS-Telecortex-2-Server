import { rgb2ws2811, rgb2ws2812 } from './ws281x';

describe('rgb2ws2811', () => {
  it('works', () => {
    expect(rgb2ws2811({ r: 255, g: 15, b: 0 }, 1)).toEqual([
      ((15 & 0xff) << 16) + ((255 & 0xff) << 8) + (0 & 0xff)
    ]);
  });
  it('accepts and uses brightness', () => {
    expect(rgb2ws2811({ r: 128, g: 64, b: 0 }, 0.5)).toEqual([
      ((32 & 0xff) << 16) + ((64 & 0xff) << 8) + (0 & 0xff)
    ]);
  });
});
describe('rgb2ws2812', () => {
  it('works', () => {
    expect(rgb2ws2812({ r: 255, g: 15, b: 0 }, 1)).toBeCloseToBytes([
      ((15 & 0xff) << 16) + ((255 & 0xff) << 8) + (0 & 0xff)
    ]);
  });
  it('accepts and uses brightness', () => {
    expect(rgb2ws2812({ r: 128, g: 64, b: 0 }, 0.5)).toBeCloseToBytes([
      ((32 & 0xff) << 16) + ((64 & 0xff) << 8) + (0 & 0xff)
    ]);
  });
});
