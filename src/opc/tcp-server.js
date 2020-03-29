// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import chalk from 'chalk';
import { createServer } from 'net';
import { handleAllOPCMessages } from './index';

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcTCPServer = context => {
  const { opcPort } = context;

  context.server = createServer(socket => {
    // Handle incoming messages from clients.
    let partialOPCMsg;
    socket.on('data', data => {
      // console.log(
      //   chalk`{cyan 🛰  got: ${data.toString('hex')} from ${socket.remoteAddress}:${
      //     socket.remotePort
      //   }}`
      // );
      // console.log(chalk`{cyan 🛰  got: ${data.length} bytes}`);
      if (partialOPCMsg) {
        // console.log(
        //   chalk`{cyan 🛰  continuing to parse partial first: ${partialOPCMsg.toString('hex')}}`
        // );
        data = Buffer.concat([partialOPCMsg, data]);
        // console.log(chalk`{cyan 🛰  } data is now: ${data.toString('hex')}`);
      }
      partialOPCMsg = handleAllOPCMessages(context, data);
      // console.log(chalk`{cyan 🛰  finished processing data}`);
    });

    socket.on('error', err => {
      // handle errors here
      console.error(err);
    });

    socket.on('close', () => {
      partialOPCMsg = undefined;
    });
  });

  context.server.listen(opcPort, () => {
    console.log(chalk`{cyan 🛰  TCP Server} listening on port: {white ${opcPort}}`);
  });
};
