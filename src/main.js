/* eslint-disable global-require,no-param-reassign */
import sourceMapSupport from 'source-map-support';
import { FRESH_CONTEXT, opcPort, consoleErrorHandler } from '@js-telecortex-2/js-telecortex-2-util';
import yargs from 'yargs';
import { MIDDLEWARE_OPTIONS } from './opc';
import { opcTCPServer } from './opc/tcp-server';
import { opcUDPServer } from './opc/udp-server';
import 'core-js/es/object/from-entries';

sourceMapSupport.install();

// const SERVER_CONF = require('./config').default;

const configureSpi = (context, { spiOptions }) => {
  const { clockSpeed, mode, channels } = spiOptions;
  let SPI;
  if (process.platform === 'linux') {
    SPI = require('pi-spi');
  } else {
    SPI = require('./testSpi').default;
    console.warn('USING FAKE SPI');
  }
  Object.entries(channels).forEach(([channelIdx, { bus, device }]) => {
    const spi = SPI.initialize(`/dev/spidev${bus}.${device}`);
    spi.clockSpeed(clockSpeed);
    spi.dataMode(mode);
    context.channels[channelIdx] = data => {
      spi.transfer(Buffer.from(data), data.length, consoleErrorHandler);
    };
  });
};

const configurePbx = (context, { pbxOptions }) => {
  const { ports, channels } = pbxOptions;
  const PBX = require('pixelblaze-expander');
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

const DEVTYPE_OPTIONS = {
  PBX: configurePbx,
  SPI: configureSpi
};

const TRANSPORT_OPTIONS = {
  TCP: opcTCPServer,
  UDP: opcUDPServer
};

const groupYargsOptions = (options, group) => {
  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => {
      return [`${group}-${key}`, { ...value, group }];
    })
  );
};

const unpackYargsGroup = (options, group, args) => {
  const argKeys = Object.keys(args);
  return Object.fromEntries([
    [
      `${group}Options`,
      Object.entries(options).reduce((accumulator, [key, spec]) => {
        const target = `${group}-${key}`;
        if (argKeys.includes(target)) {
          let value = args[target];
          if (spec.json) {
            try {
              value = JSON.parse(value);
            } catch (err) {
              throw new SyntaxError(`could not parse JSON string: '${value}'\n${err}`);
            }
          }
          accumulator[key] = value;
        }
        return accumulator;
      }, {})
    ]
  ]);
};

const parseArgs = args => {
  const spiOptions = {
    clockSpeed: {
      description: 'SPI Clock speed to use for all devices',
      default: 3e6,
      type: 'number'
    },
    mode: {
      description: 'SPI Data mode to use for all devices',
      default: 0,
      type: 'number'
    },
    channels: {
      description: 'SPI Channel information (as JSON)',
      type: 'string',
      json: true,
      default:
        '{"0": {"bus": 0, "device": 0}, "1": {"bus": 0, "device": 1}, "2": {"bus": 1, "device": 0}, "3": {"bus": 1, "device": 1}}'
    }
  };

  const pbxOptions = {
    ports: {
      description: 'PBX Serial port definitions for js-pixelblaze-expander',
      type: 'string',
      json: true,
      default:
        '{"0": {"name": "/dev/ttyS0", "options": {"channels": { "0": { "capacity": 300 }, "1": { "capacity": 300 }, "2": { "capacity": 300 }, "3": { "capacity": 300 }, "4": { "capacity": 300 }, "5": { "capacity": 300 }}}}}'
    },
    channels: {
      description: 'PBX channel definitions for js-pixelblaze-expander',
      type: 'string',
      json: true,
      default:
        '{"0": { "port": 0, "channel": 0 }, "1": { "port": 0, "channel": 1 }, "2": { "port": 0, "channel": 2 }, "3": { "port": 0, "channel": 3 }, "4": { "port": 0, "channel": 4 }, "5": { "port": 0, "channel": 5 }}'
    }
  };

  const result = yargs
    .options({
      devType: {
        description: 'Type of device used',
        alias: 'd',
        default: 'SPI',
        choices: Object.keys(DEVTYPE_OPTIONS)
      },
      port: {
        description: 'port used to listen for OPC commands',
        alias: 'p',
        default: opcPort,
        type: 'number'
      },
      transportProtocol: {
        description: 'OSI Transport Layer protocol with which the server will listen',
        alias: 't',
        default: 'UDP',
        choices: Object.keys(TRANSPORT_OPTIONS)
      },
      middlewareProtocol: {
        description: 'Protocol used to translate colours before sending to device',
        alias: 'm',
        default: 'colours2sk9822',
        choices: Object.keys(MIDDLEWARE_OPTIONS)
      }
    })
    .options(groupYargsOptions(spiOptions, 'spi'))
    .options(groupYargsOptions(pbxOptions, 'pbx'))
    .help()
    .alias('help', 'h')
    .parse(args);
  return {
    ...result,
    ...unpackYargsGroup(spiOptions, 'spi', result),
    ...unpackYargsGroup(pbxOptions, 'pbx', result)
  };
};

export const server = args => {
  // const config = { ...SERVER_CONF, ...parseArgs() };
  const config = parseArgs(args);
  console.log('config: ', config);
  const { port, devType, middlewareProtocol, transportProtocol } = config;
  // TODO: flick status led

  const context = {
    ...FRESH_CONTEXT,
    channels: {},
    opcPort: port,
    middlewareProtocol
  };

  const configureFn = DEVTYPE_OPTIONS[devType];
  if (!configureFn) throw new Error(`unknown devType: `, devType);
  configureFn(context, config);

  const serverFn = TRANSPORT_OPTIONS[transportProtocol];
  if (!serverFn) throw new Error(`unknown transportProtocol: `, transportProtocol);
  serverFn(context);
};

server(process.argv);
