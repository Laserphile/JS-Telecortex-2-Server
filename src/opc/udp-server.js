// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import chalk from 'chalk';
import { createSocket } from 'dgram';
import { handleAllOPCMessages } from './index';

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcUDPServer = context => {
  const { opcPort } = context;
  // console.log(chalk`{cyan 🛰  UDP Server} About to create OPC UDP server on port ${opcPort}`);

  context.server = createSocket('udp4', () => {
    // console.log(chalk`{cyan 🛰  UDP Server} socket create callback`);
  });

  context.server.on('error', err => {
    console.log(chalk`{cyan 🛰  UDP Server} error:\n${err.stack}`);
    context.server.close();
  });

  context.server.on('message', (msg, rinfo) => {
    // console.log(chalk`{cyan 🛰  UDP Server} got: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`);
    handleAllOPCMessages(context, msg);
  });

  context.server.on('listening', () => {
    const address = context.server.address();
    console.log(chalk`{cyan 🛰  UDP Server} listening on port: {white ${address.address}:${address.port}}`);
  });

  context.server.bind(opcPort, '0.0.0.0', () => {
    // console.log(chalk`{cyan 🛰  UDP Server}  bind callback`);
  });

  console.log(`After bind ${context.server}`);

  // context.server.close(() => {
  //   console.log('socket close callback');
  // });

  // console.log(`After close ${context.server}`);
  return context;
};
