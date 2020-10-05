/* eslint-disable global-require,no-param-reassign */
import sourceMapSupport from 'source-map-support';
import { FRESH_CONTEXT, opcPort, consoleErrorHandler } from '@js-telecortex-2/js-telecortex-2-util';
import { opcTCPServer } from './opc/tcp-server';
import { opcUDPServer } from './opc/udp-server';

sourceMapSupport.install();

const SERVER_CONF = {
  /**
   * port used to listen for OPC commands
   */
  port: opcPort,
  /**
   * Type of device used ('spi' or 'pbx')
   */
  devType: 'spi',
  // The OSI Transport Layer protocol to use (TCP / UDP)
  transportProtocol: 'UDP'
};

export const RPI_SPIDEVS = {
  /**
   * (Object) Options for when `devType === 'spi'`
   */
  spiOptions: {
    /**
     * (Integer) SPI Clock Speed
     */
    clockSpeed: 3e6,
    /**
     * (Integer) SPI Data Mode
     */
    mode: 0,
    /**
     * (Object<Int, Object>) SPI channels, where the object keys are channel numbers, and object
     * values define the spi device
     */
    channels: {
      /* spidev0.0 */
      0: {
        /**
         * (Integer) SPI Bus number
         */
        bus: 0,
        /**
         * (Integer) SPI Device number
         */
        device: 0
      },
      /* spidev0.1 */
      1: {
        bus: 0,
        device: 1
      },
      /* spidev1.0 */
      2: {
        bus: 1,
        device: 0
      },
      /* spidev1.1 */
      3: {
        bus: 1,
        device: 1
      }
    }
  },
  pbxOptions: {
    /**
     * (Object) serial port definitions to be used. See
     * <https://github.com/derwentx/js-pixelblaze-expander> for more details
     */
    ports: {
      0: {
        /**
         * (Object) serial port name. See
         * <https://github.com/derwentx/js-pixelblaze-expander> for more details
         */
        name: '/dev/tty.usbserial-AD025M69',
        /**
         * (Object) serial port options. See
         * <https://github.com/derwentx/js-pixelblaze-expander> for more details
         */
        options: {
          channels: {
            0: { capacity: 300 },
            1: { capacity: 300 },
            2: { capacity: 300 },
            3: { capacity: 300 },
            4: { capacity: 300 },
            5: { capacity: 300 }
          }
        }
      }
    },
    channels: {
      0: { port: 0, channel: 0 },
      1: { port: 0, channel: 1 },
      2: { port: 0, channel: 2 },
      3: { port: 0, channel: 3 },
      4: { port: 0, channel: 4 },
      5: { port: 0, channel: 5 }
    }
  },
  /**
   * (String) OSI Transport Layer protocol with which the server will listen ('TCP' or 'UDP')
   */
  transportProtocol: 'UDP',
  /**
   * (String) Protocol to talk to the LEDs over SPI. Only 'colours2sk9822' is supported.
   * 'colours2ws2811' is unstable.
   */
  protocol: 'colours2sk9822'
};

let SPI;
let PBX;
// noinspection ES6ModulesDependencies
switch (SERVER_CONF.devType) {
  case 'pbx':
    PBX = require('pixelblaze-expander');
    break;
  case 'spi':
  default:
    if (process.platform === 'linux') {
      SPI = require('pi-spi');
    } else {
      SPI = require('./testSpi').default;
    }
    break;
}

const configureSpi = (context, config) => {
  const { clockSpeed, mode, channels } = config.spiOptions;
  Object.entries(channels).forEach(([channelIdx, { bus, device }]) => {
    const spi = SPI.initialize(`/dev/spidev${bus}.${device}`);
    spi.clockSpeed(clockSpeed);
    spi.dataMode(mode);
    context.channels[channelIdx] = data => {
      spi.transfer(Buffer.from(data), data.length, consoleErrorHandler);
    };
  });
};

const configurePbx = (context, config) => {
  const { ports, channels } = config.pbxOptions;
  context.devices = {};
  Object.entries(ports).forEach(([portIdx, { name, options }]) => {
    context.devices[portIdx] = new PBX.ExpanderDevice(name, options);
  });
  Object.entries(channels).forEach(([channelIdx, { port, channel }]) => {
    context.channels[channelIdx] = data => {
      // console.log(JSON.stringify(data));
      context.devices[port].send(channel, data, true);
    };
  });
};

const server = () => {
  const { port, devType, protocol, transportProtocol } = SERVER_CONF;
  // TODO: flick status led

  const context = {
    ...FRESH_CONTEXT,
    channels: {},
    opcPort: port,
    protocol
  };

  let configureFn;
  switch (devType) {
    case 'pbx':
      configureFn = configurePbx;
      break;
    case 'spi':
    default:
      configureFn = configureSpi;
      break;
  }

  configureFn(context, SERVER_CONF);

  let serverFn;
  switch (transportProtocol) {
    case 'TCP':
      serverFn = opcTCPServer;
      break;
    case 'UDP':
      serverFn = opcUDPServer;
      break;
    default:
      console.log(`unknown transportProtocol: ${transportProtocol}`);
  }

  serverFn(context);
};

server();
