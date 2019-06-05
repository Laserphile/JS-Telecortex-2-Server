/* eslint-disable global-require,no-param-reassign */
import { RPI_SPIDEVS, FRESH_CONTEXT, SERVER_CONF } from '@js-telecortex-2/js-telecortex-2-util';
import { opcTCPServer } from './opc/tcp-server';

let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('./testSpi').default;
}

const server = () => {
  const { spiClockSpeed, spiMode, opcPort } = SERVER_CONF;
  // TODO: flick status led
  const channels = Object.entries(RPI_SPIDEVS).reduce((accumulator, [channel, spec]) => {
    spec.spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
    spec.spi.clockSpeed(spiClockSpeed);
    spec.spi.dataMode(spiMode);
    accumulator[channel] = spec;
    return accumulator;
  }, {});

  const context = {
    ...FRESH_CONTEXT,
    channels,
    opcPort
  };
  opcTCPServer(context);
  // opcUDPServer(context);
};

server();
