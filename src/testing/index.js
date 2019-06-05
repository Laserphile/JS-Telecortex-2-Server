export const mockSpi = mockFunc => ({ transfer: mockFunc });

export const mockSingleChannel = spi => ({
  0: {
    bus: 0,
    device: 0,
    spi
  }
});

export const mockMultiChannel = (spi0, spi1, spi2, spi3) => ({
  0: {
    bus: 0,
    device: 0,
    spi: spi0
  },
  1: {
    bus: 0,
    device: 1,
    spi: spi1
  },
  2: {
    bus: 1,
    device: 0,
    spi: spi2
  },
  3: {
    bus: 0,
    device: 1,
    spi: spi3
  }
});
