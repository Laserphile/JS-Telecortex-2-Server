import { createGammaTable } from './gamma'

describe('createGammaTable', () => {
  it('works', ()=>{
    expect(createGammaTable(3, 1.5)).toMatchSnapshot();
  })
});
