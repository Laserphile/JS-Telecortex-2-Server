/* eslint-disable global-require,no-param-reassign */
import { FRESH_CONTEXT, opcPort } from '@js-telecortex-2/js-telecortex-2-util';
import { opcTCPServer } from './opc/tcp-server';

let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('./testSpi').default;
}

const SERVER_CONF = {
  // port used to listen for OPC commands
  port: opcPort,
  // SPI Clock Speed
  spiClockSpeed: 3e6,
  // SPI Data Mode
  spiMode: 0,
  // Protocol to talk to the LEDs over SPI
  protocol: 'colours2sk9822'
};

export const RPI_SPIDEVS = {
  0: {
    bus: 0,
    device: 0
  },
  1: {
    bus: 0,
    device: 1
  },
  2: {
    bus: 1,
    device: 0
  },
  3: {
    bus: 1,
    device: 1
  }
};

const server = () => {
  const { spiClockSpeed, spiMode, port, protocol } = SERVER_CONF;
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
    opcPort: port,
    protocol
  };
  opcTCPServer(context);
  // opcUDPServer(context);
};

server();
