/* eslint-disable global-require,no-param-reassign */
import sourceMapSupport from 'source-map-support'
import { FRESH_CONTEXT, opcPort, consoleErrorHandler } from '@js-telecortex-2/js-telecortex-2-util';
import { opcTCPServer } from './opc/tcp-server';
import { opcUDPServer } from './opc/udp-server';

sourceMapSupport.install();
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
  // Protocol to talk to the LEDs
  protocol: 'colours2sk9822',
  // Type of device used ('spi')
  devType: 'spi',
  // The OSI Transport Layer protocol to use (TCP / UDP)
  transportProtocol: 'UDP'
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
  const { spiClockSpeed, spiMode, port, protocol, devType, transportProtocol } = SERVER_CONF;
  // TODO: flick status led

  const channels = {};

  if (devType === 'spi') {
    Object.entries(RPI_SPIDEVS).forEach(([channel, spec]) => {
      const spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
      spi.clockSpeed(spiClockSpeed);
      spi.dataMode(spiMode);
      channels[channel] = data => {
        spi.transfer(Buffer.from(data), data.length, consoleErrorHandler);
      };
    });
  }

  const context = {
    ...FRESH_CONTEXT,
    channels,
    opcPort: port,
    protocol
  };

  switch (transportProtocol) {
    case 'TCP':
      opcTCPServer(context);
      break;
    case 'UDP':
      opcUDPServer(context);
      break;
    default:
      console.log(`unknown transportProtocol: ${transportProtocol}`);
  }
};

server();
