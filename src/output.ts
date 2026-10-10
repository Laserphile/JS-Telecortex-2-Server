import { encodeSk9822 } from "./sk9822";

/** Starts writing length bytes of data and calls done when finished. data must not change until then. */
export type WriteFn = (data: Uint8Array, length: number, done: (error: Error | null) => void) => void;

/** spidev's default bufsiz, the most one write can send */
export const MAX_TRANSFER_LENGTH = 4096;

export type PanelStats = { received: number; written: number; dropped: number; errors: number };

/**
 * Sends one panel's frames. While a write is in flight only the newest frame waits,
 * so a slow SPI bus drops frames instead of building up latency.
 */
export class PanelOutput {
  readonly name: string;
  #write: WriteFn;
  #brightness: number;
  #sending = new Uint8Array(MAX_TRANSFER_LENGTH);
  #next = new Uint8Array(MAX_TRANSFER_LENGTH);
  #nextLength = 0;
  #busy = false;
  #stats: PanelStats = { received: 0, written: 0, dropped: 0, errors: 0 };

  /** @param brightness from brightnessByte() */
  constructor(name: string, write: WriteFn, brightness: number) {
    this.name = name;
    this.#write = write;
    this.#brightness = brightness;
  }

  send(rgb: Uint8Array): void {
    this.#stats.received += 1;
    if (this.#busy) {
      if (this.#nextLength) this.#stats.dropped += 1;
      this.#nextLength = encodeSk9822(rgb, this.#brightness, this.#next);
    } else {
      this.#start(encodeSk9822(rgb, this.#brightness, this.#sending));
    }
  }

  /** Returns the counts since the last call, and resets them */
  takeStats(): PanelStats {
    const stats = this.#stats;
    this.#stats = { received: 0, written: 0, dropped: 0, errors: 0 };
    return stats;
  }

  #start(length: number) {
    this.#busy = true;
    this.#write(this.#sending, length, this.#done);
  }

  #done = (error: Error | null) => {
    this.#busy = false;
    if (error) {
      if (!this.#stats.errors) console.error(`${this.name}: write failed:`, error.message);
      this.#stats.errors += 1;
    } else {
      this.#stats.written += 1;
    }
    if (this.#nextLength) {
      [this.#sending, this.#next] = [this.#next, this.#sending];
      const length = this.#nextLength;
      this.#nextLength = 0;
      this.#start(length);
    }
  };
}
