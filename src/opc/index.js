// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import chalk from 'chalk';
import {
  colourRateLogger
  // coloursToString
} from '@js-telecortex-2/js-telecortex-2-util';
import { colours2sk9822, colours2ws2811, colours2ws2812, colours2rgb } from '../protocols';
import { OPC_HEADER_LEN, parseOPCBody, parseOPCHeader } from './parser';
import { PartialOPCMsgError } from './errors';

// const colourLogLimit = 10;

export const MIDDLEWARE_OPTIONS = {
  colours2sk9822,
  colours2ws2811,
  colours2ws2812,
  colours2rgb
};

/**
 * parse a single OPC message and send data to channels
 * @return number of bytes read
 */
export const handleOPCMessage = (context, msg) => {
  // TODO
  const { channels, brightness, middlewareProtocol } = context;
  const middlewareFn = MIDDLEWARE_OPTIONS[middlewareProtocol];
  if (!middlewareFn) throw new Error(`unknown middlewareProtocol: `, middlewareProtocol);
  const header = parseOPCHeader(msg);
  const { channel, length } = header;
  // console.log(chalk`{bgMagenta.black  header: } {cyan ${JSON.stringify(header)}}`);
  // console.log(`channels: ${JSON.stringify(channels)}`);
  if (Object.keys(channels).indexOf(String(channel)) < 0) {
    // TODO: throw error instead of just console.log?
    console.error(chalk`{red invalid channel ${channel} not in ${Object.keys(channels)}}`);
    return OPC_HEADER_LEN + length;
  }
  const colours = parseOPCBody(msg, length);
  context.channelColours = { [channel]: colours };
  if (channel >= 0) {
    colourRateLogger(context);
  }
  // TODO: perhaps put message on an async queue
  const dataBuff = middlewareFn(colours, brightness);
  // console.log(
  //   [
  //     chalk`{bgMagenta.black  body: } (${colours.length})`,
  //     coloursToString(colours.slice(0, colourLogLimit || colours.length)) +
  //       (colours.length > colourLogLimit ? '...' : ''),
  //     dataBuff.slice(0, colourLogLimit || dataBuff.length)
  //   ].join('\n')
  // );
  channels[header.channel](dataBuff);
  return OPC_HEADER_LEN + length;
};

/**
 * Handle all OPC messages
 * @return the final partial opcMessage || empty buffer
 */
export const handleAllOPCMessages = (context, data) => {
  let bytesRead;
  try {
    while (data.length > 0) {
      bytesRead = handleOPCMessage(context, data);
      data = data.slice(bytesRead);
    }
  } catch (err) {
    if (err instanceof PartialOPCMsgError) return data;
    console.error(err);
  }
  return undefined;
};
