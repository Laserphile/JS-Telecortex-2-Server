import { parse } from 'binary';
import { OPC_BODY_FIELDS } from '@js-telecortex-2/js-telecortex-2-util';
import { PartialOPCMsgError } from './errors';

export const OPC_HEADER_LEN = 4;

/**
 * parse header from OPC message.
 * @return an object containing the channel, command and length
 */
export const parseOPCHeader = msg => {
  if (msg === undefined) throw new Error('msg is undefined');
  if (msg.length < OPC_HEADER_LEN) throw new PartialOPCMsgError('msg too short to have header');
  return parse(msg)
    .word8u('channel')
    .word8u('command')
    .word16bu('length').vars;
};

/**
 * parse body from OPC message.
 * body message format: R0G0B0R1G1B1
 * @return an array of colorsys RGB objects
 */
export const parseOPCBody = (msg, bodyLength = undefined) => {
  // skip over the message header
  if (msg.length < OPC_HEADER_LEN) throw new PartialOPCMsgError('msg too short to have body');

  if (bodyLength && msg.length < OPC_HEADER_LEN + bodyLength)
    throw new PartialOPCMsgError(`msg too short for body length ${bodyLength}`);

  const nullSafeBodyLength = bodyLength || msg.length - OPC_HEADER_LEN;

  const body = msg.slice(OPC_HEADER_LEN, OPC_HEADER_LEN + nullSafeBodyLength);
  // console.log(chalk`body: (${bodyLength}) ${body.toString('hex')}`);

  return Array.from(
    {
      length: Math.floor(body.length / OPC_BODY_FIELDS.length)
    },
    (_, index) =>
      OPC_BODY_FIELDS.reduce(
        (accumulator, key, offset, source) =>
          Object.assign(accumulator, { [key]: body[index * source.length + offset] }),
        {}
      )
  );
};
