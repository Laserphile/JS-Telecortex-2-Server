```txt

  ______________    ________________  ____  _____________  __    ________
 /_  __/ ____/ /   / ____/ ____/ __ \/ __ \/_  __/ ____/ |/ /   /  _/  _/
  / / / __/ / /   / __/ / /   / / / / /_/ / / / / __/  |   /    / / / /
 / / / /___/ /___/ /___/ /___/ /_/ / _, _/ / / / /___ /   |   _/ /_/ /
/_/ /_____/_____/_____/\____/\____/_/ |_| /_/ /_____//_/|_|  /___/___/


```

Receives [Open Pixel Control](http://openpixelcontrol.org/) over UDP and drives up to four SK9822/APA102 panels from a Raspberry Pi's SPI ports. [Chromatik](https://chromatik.co/) sends the pixels. It is TypeScript on [Bun](https://bun.sh/), with no runtime dependencies.

![Moonbase Dome](img/telecortex-lx-12.gif)
![Timecrime DJing](img/telecortex-timecrime-djing-short.gif?raw=true)
![inside dome](img/telecortex-inside-dome.gif?raw=true)

[Video of Steamed Hams on a previous version of TeleCortex](https://www.youtube.com/watch?v=OHrLvZHOcns)

## Chromatik

The TeleCortex fixtures in [chromatik-fixtures](https://github.com/moonbase-labs/chromatik-fixtures) send OPC to this server. For each panel, set the fixture's host to the Pi, the port to 42069, the OPC channel to the panel's output (0 to 3) and the transport to `udp`.

OPC channel 0 is the first output, not a broadcast to every output.

## Hardware and OS

- Raspberry Pi 3 Model B or B+. Tested on a 3B+.
- 64-bit balenaOS, device type `raspberrypi3-64` ("Raspberry Pi 3 (using 64bit OS)"). Bun has no 32-bit ARM build, so the 32-bit `raspberrypi3` type won't run it. Tested on balenaOS 8.0.9+rev1.

The outputs, with the default `TELECORTEX_SPI_CHANNELS`:

| OPC channel | Device |
| --- | --- |
| 0 | `/dev/spidev0.0` |
| 1 | `/dev/spidev0.1` |
| 2 | `/dev/spidev1.0` |
| 3 | `/dev/spidev1.1` |

## Setting up a balena fleet

Everything the Pi runs comes from this repository: `Dockerfile` and `docker-compose.yml` define the container. The only settings that can't live in a container are the boot settings that turn on the SPI ports. Those are fleet configuration, so they are listed here. To set up a fleet from scratch:

1. Create a fleet with the default device type **Raspberry Pi 3 (using 64bit OS)**. The current one is `gh_vanbujm/moonbase-cortex-next`.
2. In the fleet's **Configuration** tab, set:

   | Variable | Value | What it does |
   | --- | --- | --- |
   | `BALENA_HOST_CONFIG_dtoverlay` | `spi1-2cs` | Turns on SPI1 with two chip selects, giving `/dev/spidev1.0` and `1.1` |
   | `BALENA_HOST_CONFIG_dtparam` | `"i2c_arm=on","spi=on","audio=on"` | `spi=on` gives `/dev/spidev0.0` and `0.1`. The others are balena's defaults. |

   The supervisor writes these to `config.txt` and reboots the Pi once.
3. Flash balenaOS from the fleet's **Add device** dialog. The Production edition works; Development also enables local mode.
4. From this directory, deploy with `balena push gh_vanbujm/moonbase-cortex-next`. balena's builders build `docker-compose.yml` for aarch64.

To check a new Pi, open a host OS terminal on the balena dashboard and run `ls /dev/spidev*`. It should list all four devices.

## Settings

Every setting is a command-line flag or an environment variable, so a balena fleet or device variable changes it without a rebuild. A flag beats a variable. The names match the old Node.js server.

| Flag | Variable | Default | |
| --- | --- | --- | --- |
| `--port`, `-p` | `TELECORTEX_PORT` | `42069` | UDP port to listen on |
| `--brightness`, `-b` | `TELECORTEX_BRIGHTNESS` | `1` | SK9822 global brightness, from 0 to 1 |
| `--spi-clock-speed` | `TELECORTEX_SPI_CLOCK_SPEED` | `3000000` | SPI clock in Hz to request. `docker-compose.yml` sets 6 MHz; see Performance. |
| `--spi-mode` | `TELECORTEX_SPI_MODE` | `0` | SPI mode, from 0 to 3 |
| `--spi-channels` | `TELECORTEX_SPI_CHANNELS` | the table above | JSON object mapping each OPC channel to a bus and device, e.g. `{"0": {"bus": 0, "device": 0}}` |

## How it works

Each UDP datagram can hold several OPC messages. For each set-pixel-colours message (command 0), the server gamma-corrects the colours (gamma 2.8, as before) and encodes an SK9822 frame into the channel's buffer. It then writes the frame to the channel's spidev.

- **Writes don't block.** They run on Bun's thread pool, so the two SPI buses send at the same time and UDP packets keep arriving.
- **Latency doesn't build up.** While a write is in flight, only the newest frame for that channel waits. Older ones are dropped and counted.
- **Frames end properly.** After the LEDs, each frame has a zero reset frame and an end frame of at least one clock edge per two LEDs. Without them, SK9822s show each frame only when the next one arrives, which is how the old server behaved. The start frame and LED bytes are unchanged.

## Performance

The SPI clock is the limit. A 316-LED frame is 1,292 bytes and two panels share each bus, so the most each channel can get is about 48 fps per real MHz for large panels (59 for small ones), a little less after overhead. Channels 2 and 3 run on SPI1, the auxiliary SPI controller, which measured 11 to 17% slower.

**The real clock is lower than requested.** The Pi 3's SPI clock is divided from its core clock. The kernel calculates the divider for 400 MHz, but the core drops to 250 MHz when the CPU is idle, so the real clock is 62 to 98% of the request. An oscilloscope showed about 8 MHz for a 12 MHz request.

`docker-compose.yml` requests 6 MHz, 3.7 to 5.9 MHz real. Chromatik sends about 60 fps, which needs only about 1.3 MHz, so a faster clock mainly cuts latency, at more risk to the signal. A large panel showed clean output at about 8 MHz real.

Measured on a Raspberry Pi 3B+ with four 316-LED channels:

| Requested | Most frames per channel, SPI0 / SPI1 |
| --- | --- |
| 3 MHz | 101 / 90 fps |
| 6 MHz | 197 / 172 fps |
| 12 MHz | 369 / 305 fps |

At 60 fps on all four channels, every frame is written and the server uses about 3% CPU.

Encoding a packet takes about 1/130 of the old server's CPU time, measured on the same machine and runtime.

While frames arrive, the server logs each channel's received and written frame rates every 10 seconds, plus any dropped frames and write errors.

## Development

```bash
bun install
bun test
bun run typecheck
bun start                 # on a Mac, SPI output is discarded
bun run test-pattern -- --host red-mountain.local --channels 0 --colour 255,0,0
```

`scripts/test-pattern.ts` sends a dim scrolling rainbow, or a solid `--colour`, to check panels without Chromatik. A high `--fps` shows how fast SPI keeps up, in the server's log.

The tests compare the encoder byte for byte with the old server's, and use its jest snapshots as reference data.

## The old Node.js server

Up to 0.2.2 this was a Node 10 server built with Babel and webpack, using the native `pi-spi` addon. It also supported TCP, ws2811/ws2812/rgb output and PixelBlaze expanders. It is on the `master` branch, and the fleet `moonbase-cortex` runs it on 32-bit balenaOS.
