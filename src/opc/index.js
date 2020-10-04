// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import chalk from 'chalk';
import {
  colourRateLogger
  // coloursToString
} from '@js-telecortex-2/js-telecortex-2-util';
import { colours2sk9822, colours2ws2811, colours2ws2812 } from '../protocols/index';
import { OPC_HEADER_LEN, parseOPCBody, parseOPCHeader } from './parser';
import { PartialOPCMsgError } from './errors';

/**
 * parse a single OPC message and send data to channels
 * @return number of bytes read
 */
export const handleOPCMessage = (context, msg) => {
  // TODO
  const { channels, brightness, protocol } = context;
  const protocolFn = {
    colours2sk9822,
    colours2ws2811,
    colours2ws2812
  }[protocol];
  const header = parseOPCHeader(msg);
  // console.log(chalk`{bgMagenta.black  header: } {cyan ${JSON.stringify(header)}}`);
  // console.log(`channels: ${JSON.stringify(channels)}`);
  if (Object.keys(channels).indexOf(String(header.channel)) < 0) {
    // TODO: throw error instead of just console.log?
    console.error(chalk`{red invalid channel ${header.channel} not in ${Object.keys(channels)}}`);
    return OPC_HEADER_LEN + header.length;
  }
  const colours = parseOPCBody(msg, header.length);
  context.channelColours = { [header.channel]: colours };
  if (header.channel >= 0) {
    colourRateLogger(context);
  }
  // TODO: perhaps put message on an async queue
  const dataBuff = protocolFn(colours, brightness);
  // console.log(
  //   [
  //     chalk`{bgMagenta.black  body: } (${colours.length})`,
  //     coloursToString(colours.slice(0, colourLimit ? colourLimit : colours.length)) + (colours.length > colourLimit ? '...' : ''),
  //     dataBuff.slice(0, colourLimit ? colourLimit : dataBuff.length )
  //   ].join('\n')
  // );
  channels[header.channel](dataBuff);
  return OPC_HEADER_LEN + header.length;
};

/**
 * Handle all OPC messages
 * @return the final partial opcMessage || empty buffer
 */
export const handleAllOPCMessages = (context, data) => {
  let bytesRead;
  while (data.length > 0) {
    try {
      bytesRead = handleOPCMessage(context, data);
    } catch (err) {
      if (err instanceof PartialOPCMsgError) return data;
      console.error(err);
      return undefined;
    }
    data = data.slice(bytesRead);
    // console.log(chalk`{cyan 🛰  read: ${bytesRead}, remaining: ${data.length} bytes}`);
  }
  return undefined;
};
