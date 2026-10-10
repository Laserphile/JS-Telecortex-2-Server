import { dlopen, FFIType, read } from "bun:ffi";
import { openSync, write } from "node:fs";
import type { WriteFn } from "./output";

// From <linux/spi/spidev.h>: _IOW('k', nr, size) = 1 << 30 | size << 16 | 'k' << 8 | nr
const SPI_IOC_WR_MODE = 0x40016b01;
const SPI_IOC_WR_MAX_SPEED_HZ = 0x40046b04;

const openLibc = () =>
  dlopen("libc.so.6", {
    // ioctl is variadic, but on aarch64 Linux variadic arguments are passed like fixed ones
    ioctl: { args: [FFIType.i32, FFIType.u64, FFIType.ptr], returns: FFIType.i32 },
    __errno_location: { args: [], returns: FFIType.ptr },
  }).symbols;
let libc: ReturnType<typeof openLibc> | undefined;

function ioctl(fd: number, request: number, arg: Uint8Array | Uint32Array, what: string) {
  libc ??= openLibc();
  if (libc.ioctl(fd, request, arg) < 0) {
    throw new Error(`${what} failed with errno ${read.i32(libc.__errno_location()!, 0)}`);
  }
}

/**
 * Opens an spidev device with the given mode and clock speed.
 * Writes run on Bun's thread pool, so they don't block the event loop and the two SPI buses send in parallel.
 */
export function openSpidev(path: string, mode: number, speedHz: number): WriteFn {
  const fd = openSync(path, "r+");
  ioctl(fd, SPI_IOC_WR_MODE, Uint8Array.of(mode), `${path}: setting SPI mode ${mode}`);
  ioctl(fd, SPI_IOC_WR_MAX_SPEED_HZ, Uint32Array.of(speedHz), `${path}: setting SPI speed ${speedHz} Hz`);
  return (data, length, done) => write(fd, data, 0, length, null, done);
}

/** Stands in for SPI where there is none, e.g. when developing on a Mac */
export const discardWrite: WriteFn = (_data, _length, done) => queueMicrotask(() => done(null));
