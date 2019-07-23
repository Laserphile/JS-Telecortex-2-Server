import { flatten, rangeRight } from 'lodash';
import { uint8Max, uint8Bits } from '@js-telecortex-2/js-telecortex-2-util';

// order of colours in ws2811 frame
const ws2811ColourOrder = ['g', 'r', 'b'];
const ws2812ColourOrder = ['r', 'g', 'b'];
// symbols in ws281x protocol
const ws281xReset = 0b000;
const ws281xBit1 = 0b110;
const ws281xBit0 = 0b100;

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return {Uint32Array} the ws2811 frame for this pixel as a single-entry 32bit integer array
 */
export const rgb2ws2811 = (colour, brightness = 0.5) => {
  const pixels = ws2811ColourOrder.map(key => Math.round(brightness * colour[key]) % uint8Max);
  return [((pixels[0] & 0xff) << 16) + ((pixels[1] & 0xff) << 8) + (pixels[2] & 0xff)];
};

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return {Uint32Array} the ws2812 frame for this pixel as a single-entry 32 bit integer array
 */
export const rgb2ws2812 = (colour, brightness = 0.5) => {
  const pixels = ws2812ColourOrder.map(key => Math.round(brightness * colour[key]) % uint8Max);
  return [ ((pixels[0] & 0xff) << 16) + ((pixels[1] & 0xff) << 8) + (pixels[2] & 0xff) ];
};

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return {Uint32Array} a complete ws2811 message for the strip
 */
export const colours2ws2811 = (colours, brightness) =>
  flatten(colours.map(colour => rgb2ws2811(colour, brightness)));

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return {Uint32Array} a complete ws2812 message for the strip
 */
export const colours2ws2812 = (colours, brightness) =>
  flatten(colours.map(colour => rgb2ws2812(colour, brightness)));
