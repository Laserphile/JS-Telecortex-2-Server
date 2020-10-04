import { rgb2sk9822 } from './sk9822';

require('../testing/setupTests.js');

describe('rgb2sk9822', () => {
  it('works', () => {
    expect(rgb2sk9822({ r: 255, g: 0, b: 0 })).toMatchSnapshot();
  });

  it('accepts and uses brightness', () => {
    const red = { r: 255, g: 0, b: 0 };
    expect(rgb2sk9822(red, 1)).not.toEqual(rgb2sk9822(red, 0));
  });
});
