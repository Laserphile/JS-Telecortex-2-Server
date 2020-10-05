/* eslint-disable global-require,no-param-reassign */
import sourceMapSupport from 'source-map-support';
import { FRESH_CONTEXT, opcPort, consoleErrorHandler } from '@js-telecortex-2/js-telecortex-2-util';
import yargs from 'yargs';
import { MIDDLEWARE_OPTIONS } from './opc';
import { opcTCPServer } from './opc/tcp-server';
import { opcUDPServer } from './opc/udp-server';

sourceMapSupport.install();

const SERVER_CONF = require('./config').default;

const configureSpi = (context, { spiOptions }) => {
  const { clockSpeed, mode, channels } = spiOptions;
  let SPI;
  if (process.platform === 'linux') {
    SPI = require('pi-spi');
  } else {
    SPI = require('./testSpi').default;
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

const parseArgs = () => {
  return yargs
    .option('devType', {
      description: 'Type of device used',
      alias: 'd',
      default: 'SPI',
      choices: Object.keys(DEVTYPE_OPTIONS)
    })
    .option('port', {
      description: 'port used to listen for OPC commands',
      alias: 'p',
      default: opcPort,
      type: 'number'
    })
    .option('transportProtocol', {
      description: 'OSI Transport Layer protocol with which the server will listen',
      alias: 't',
      default: 'UDP',
      choices: Object.keys(TRANSPORT_OPTIONS)
    })
    .option('middlewareProtocol', {
      description: 'protocol used to translate colours before sending to device',
      alias: 'm',
      default: 'colours2sk9822',
      choices: Object.keys(MIDDLEWARE_OPTIONS)
    })
    .help()
    .alias('help', 'h')
    .parse(process.argv);
};

const server = () => {
  const config = { ...SERVER_CONF, ...parseArgs() };
  // console.log('config: ', config);
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

server();
