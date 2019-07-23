import { flatten, mapValues } from 'lodash';
import { uint8Max } from '@js-telecortex-2/js-telecortex-2-util';
import { createGammaTable } from './gamma';

// Constant prefix in first byte of sk9822 frame
const sk9822Prefix = 0xe0;
// Mask for brightness bitfield in first byte of sk9822 frame
const sk9822BrightnessMask = 0x1f;
// header bytes in sk9822 protocol
const sk9822ResetFrame = [0x00, 0x00, 0x00, 0x00];
// order of colours in sk9822 frame
const sk9822ColourOrder = ['b', 'g', 'r'];

export const SK9822_GAMMA = createGammaTable(uint8Max, 2.8);

export const sk9822GammaCorrect = colour =>
  mapValues(colour, colorVal => SK9822_GAMMA[Math.round(colorVal)]);

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return {number[]} the sk9822 frame for this pixel
 */
export const rgb2sk9822 = (colour, brightness = 0.5) => {
  // first byte is a constant 0xE0 + 5 bit brightness value
  const correctedColour = sk9822GammaCorrect(colour);
  return [sk9822Prefix + Math.round(brightness * sk9822BrightnessMask)].concat(
    sk9822ColourOrder.map(key => correctedColour[key] % uint8Max)
  );
};

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return {number[]} a complete sk9822 message for the strip
 */
export const colours2sk9822 = (colours, brightness) =>
  Array.from(sk9822ResetFrame).concat(flatten(colours.map(colour => rgb2sk9822(colour, brightness))));
