import { colours2rgb } from './raw';

require('../testing/setupTests.js');

describe('colours2rgb', () => {
  it('works', () => {
    expect(colours2rgb([{ r: 255, g: 0, b: 0 }])).toMatchSnapshot();
  });
});
