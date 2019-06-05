/**
 * Thrown when an incomplete OPC Message is detected
 */
export class PartialOPCMsgError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, PartialOPCMsgError);
  }
}
