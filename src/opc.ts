/**
 * Open Pixel Control, http://openpixelcontrol.org/
 * Each message is a 4 byte header (channel, command, big-endian body length) followed by the body.
 */
export const OPC_HEADER_LENGTH = 4;
/** Body is 8-bit RGB triplets: R0 G0 B0 R1 G1 B1 ... */
export const OPC_SET_PIXEL_COLOURS = 0;

export type PixelHandler = (channel: number, rgb: Uint8Array) => void;

/**
 * Calls onPixels for each set-pixel-colours message in a UDP datagram.
 * rgb is a view into data, so it is only valid during the call.
 * Messages with other commands are skipped, as is a truncated message at the end.
 * Unlike the OPC spec, channel 0 is not a broadcast: it is the first output, as in the old server.
 */
export function forEachOpcMessage(data: Uint8Array, onPixels: PixelHandler): void {
  let offset = 0;
  while (offset + OPC_HEADER_LENGTH <= data.length) {
    const channel = data[offset];
    const command = data[offset + 1];
    const start = offset + OPC_HEADER_LENGTH;
    const end = start + ((data[offset + 2] << 8) | data[offset + 3]);
    if (end > data.length) return;
    if (command === OPC_SET_PIXEL_COLOURS) onPixels(channel, data.subarray(start, end));
    offset = end;
  }
}
