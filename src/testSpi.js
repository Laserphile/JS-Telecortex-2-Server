import chalk from 'chalk';

const spi = {
  clockSpeed: clockSpeed =>
    console.info(
      chalk`{bgCyan.black.bold  SPI test } {yellow Setting clock speed to: ${clockSpeed}}`
    ),
  transfer: (writebuf, readcount, cb) => {
    // uncomment at your own peril
    // console.log(
    //   chalk`{yellow.bold Transfer:} {magenta.dim ${JSON.stringify(
    //     writebuf
    //   )} : Read count: ${readcount} ${cb ? 'Callback supplied' : 'Call not supplied'}}`
    // );
    cb(null, null);
  },
  dataMode: () => {}
};

const SPI = {
  initialize: spiDevice => {
    console.info(
      chalk`{bgCyan.black.bold  SPI test } {blue Initialising spi device: ${spiDevice}}`
    );
    return spi;
  }
};

export default SPI;
