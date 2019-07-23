import { flatten, rangeRight } from 'lodash';
import { uint8Max, uint8Bits } from '@js-telecortex-2/js-telecortex-2-util';

// order of colours in ws2811 frame
const ws2811ColourOrder = ['r', 'g', 'b'];
const ws2812ColourOrder = ['g', 'r', 'b'];
// symbols in ws281x protocol
const ws281xReset = 0b000;
const ws281xBit1 = 0b110;
const ws281xBit0 = 0b100;

/**
 * Given a byte
 * @return {number[]} , a list of 3bit symbols for ws281x
 */
export const toWs281x3BitSymbols = (byte) => {
  return rangeRight(0, 8).map(bit => (0b1 << bit & byte ? ws281xBit1 : ws281xBit0));
}

/**
 * Given a list of 3 bit symbols,
 * @return {number[]} the symbos concatenated into a single stream of bytes to be transmitted MSB first
 */
export const pack3BitSymbols = (symbols) => {
  const symbolSize = 3;
  const out = new Uint8Array(Math.ceil(symbols.length * symbolSize / uint8Bits));
  var bitCount = 0;
  var mask, shift, byteIndex;
  symbols.forEach(symbol => {
    byteIndex = Math.floor(bitCount / uint8Bits);
    shift = (uint8Bits - symbolSize) - (bitCount % uint8Bits);
    if (shift >= 0) {
      mask = (symbol << shift) % uint8Max;
      out[byteIndex] |= mask;
      // console.log(`out[${byteIndex}] |= (0b${symbol.toString(2)} << ${shift} => 0b${mask.toString(2)}) => 0b${out[byteIndex].toString(2)}`)
    } else {
      mask = symbol >> -shift;
      out[byteIndex] |= mask;
      // console.log(`out[${byteIndex}] |= (0b${symbol.toString(2)} >> ${-shift} => 0b${mask.toString(2)}) => 0b${out[byteIndex].toString(2)}`)
      // Do the second byte
      shift += uint8Bits;
      mask = (symbol << shift) % uint8Max;
      byteIndex += 1;
      out[byteIndex] |= mask;
      // console.log(`out[${byteIndex}] |= (0b${symbol.toString(2)} << ${shift} => 0b${mask.toString(2)}) => 0b${out[byteIndex].toString(2)}`)
    }
    bitCount += symbolSize;
  })
  return out
}

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return {number[]} the ws2811 frame for this pixel as a list of 3-bit symbols
 */
export const rgb2ws2811 = (colour, brightness = 0.5) => {
  return flatten(ws2811ColourOrder.map(key => toWs281x3BitSymbols(Math.round(brightness * colour[key]) % uint8Max)));
};

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return {number[]} the ws2812 frame for this pixel as a list of 3-bit symbols
 */
export const rgb2ws2812 = (colour, brightness = 0.5) => {
  return flatten(ws2812ColourOrder.map(key => toWs281x3BitSymbols(Math.round(brightness * colour[key]) % uint8Max)));
};

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return {number[]} a complete ws2811 message for the strip
 */
export const colours2ws2811 = (colours, brightness) =>
  pack3BitSymbols([ws281xReset].concat(flatten(colours.map(colour => rgb2ws2811(colour, brightness)))));

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return {number[]} a complete ws2812 message for the strip
 */
export const colours2ws2812 = (colours, brightness) =>
  pack3BitSymbols([ws281xReset].concat(flatten(colours.map(colour => rgb2ws2812(colour, brightness)))));
