```txt

  ______________    ________________  ____  _____________  __    ________
 /_  __/ ____/ /   / ____/ ____/ __ \/ __ \/_  __/ ____/ |/ /   /  _/  _/
  / / / __/ / /   / __/ / /   / / / / /_/ / / / / __/  |   /    / / / /
 / / / /___/ /___/ /___/ /___/ /_/ / _, _/ / / / /___ /   |   _/ /_/ /
/_/ /_____/_____/_____/\____/\____/_/ |_| /_/ /_____//_/|_|  /___/___/


```

A rewrite of the [Telecortex](https://github.com/laserphile/telecortex) project in NodeJS which controls APA102/SK9822 LED strips over OPC

[![Build Status](https://travis-ci.org/Laserphile/JS-Telecortex-2-Server.svg?branch=master)](https://travis-ci.org/Laserphile/JS-Telecortex-2-Server)
[![Maintainability](https://api.codeclimate.com/v1/badges/ef74b26938c3f747b39f/maintainability)](https://codeclimate.com/github/Laserphile/JS-Telecortex-2-Server/maintainability)
[![codecov](https://codecov.io/gh/Laserphile/JS-Telecortex-2-Server/branch/master/graph/badge.svg)](https://codecov.io/gh/Laserphile/JS-Telecortex-2-Server)
[![Known Vulnerabilities](https://snyk.io/test/github/Laserphile/JS-Telecortex-2-Server/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Laserphile/JS-Telecortex-2-Server?targetFile=package.json)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Laserphile/JS-Telecortex-2-Server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Laserphile/JS-Telecortex-2-Server/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Laserphile/JS-Telecortex-2-Server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Laserphile/JS-Telecortex-2-Server/alerts/)

## Gifs

![Timecrime DJing](img/telecortex-timecrime-djing-short.gif?raw=true)
![inside dome](img/telecortex-inside-dome.gif?raw=true)

[Video of Steamed Hams on a previous version of TeleCortex](https://www.youtube.com/watch?v=OHrLvZHOcns)

## Coverage

![codecoverage-svg-sunburst](https://codecov.io/gh/Laserphile/JS-Telecortex-2/branch/master/graphs/sunburst.svg)

## Performance

Our Balena image running on a Raspberry Pi 3 can control 4 channels of 300 SK9822 pixels pixels with UDP over on-board WiFi at about 200 FPS.

## RaspberryPi Setup

We've created a docker image that sets up your Raspberry Pi 3B+ as an Open Pixel Control server with 4 SPI ports. The docker image is designed to run on [BalenaOS](https://www.balena.io/os/). This is the recommended way of using TeleCortex if you don't need to do development on the server. Otherwise, there's a lot of messing around required.

### Option 1: Balena Cloud (Recommended)

Sign up for [BalenaCloud](https://www.balena.io/cloud/) (it's free!) and set up an application. Use its wizard to make an image with your network details.

Or you can download and configure your own image as long as it runs docker. Head over to <https://www.balena.io/os/#download> and get yourself a BalenaOS image.

Once the Pi(s) is running you can push an image to it by following the instructions [below](#balena-dev-setup)

### Option 2: Download and run directly on Raspbian

With a fresh install of raspbian lite, get your raspberry pi configured with the correct locale using `raspi-config`. Optionally, while you're there you may wish to enable SSH, set the correct WiFi country, change the root password, and set a unique hostname.

#### Enable all 4 SPI ports on raspberry pi

(this can be done by editing the file on the SD card, or while the pi is on)
As root, add the lines

```txt
dtparam=spi=on # this one is not necessary if you've already enabled it in raspi-config
dtoverlay=spi1-2cs
```

to `/boot/config.txt` and reboot.
For more options (e.g. 5 SPI devices) and pinouts see `/boot/overlays/README`.

To test, `ls /dev | grep spidev` should show

```txt
spidev0.0
spidev0.1
spidev1.0
spidev1.1
```

#### Housekeeping

```bash
# Fresh pi needs update
sudo apt-get update && sudo apt-get upgrade
# Install essential tools
sudo apt-get install vim git zip
```

#### Install build tools for node / yarn

```bash
sudo apt-get install gcc g++ make cmake libopencv-dev
```

#### Install Node

Determine architecture

```bash
uname -m
```

_If you have an ARMv7 or later Pi: (Model 2B, 3\*)_
If you just run `sudo apt-get install nodejs` you will get an old version of node. We want version 11.

```bash
# install node 11
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
```

_If you have an ARMv6 Pi: (Model A\*, B\*, Zero)_
node 10 or above is required, but can't be installed through the official repositories as of the time of writing.
This script will install the latest node 10 (which is LTS until 2020)

```bash
ARCH=$(uname -m)
NODE=$(curl https://nodejs.org/dist/index.tab | grep v10 | grep linux-${ARCH} | cut -d $'\t' -f 1 | head -n 1)
curl "https://nodejs.org/dist/${NODE}/node-${NODE}-linux-${ARCH}.tar.gz" -o "node-${NODE}.tar.gz"
tar -C /usr/local -zxf "node-${NODE}.tar.gz"
```

#### check that Node works with

```bash
node -v
npm -v
```

#### Install yarn

If you just run `sudo apt-get install yarn` you will install [the wrong yarn](http://manpages.ubuntu.com/manpages/xenial/man1/yarn.1.html).

```bash
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```

#### Clone this repo

```bash
mkdir -p ~/Documents/GitHub
git clone https://github.com/Laserphile/JS-Telecortex-2-Server ~/Documents/GitHub/JS-Telecortex-2-Server
cd ~/Documents/GitHub/JS-Telecortex-2-Server
```

#### Install dependencies

```bash
npm install nodemon --save
yarn
```

## OSX setup

This will not run on OSX. You need spidev for pi-spi to work

### Balena dev setup

If you want to push to your pi without going through the pipeline. Make sure you also "enable local mode" on BalenaCloud if its a cloud image.

- `npm install --global --production --unsafe-perm balena-cli`
- Get the hostname of the device you want to push to with `sudo balena local scan`
- build and push to the device with `balena push <hostname>`
- Be patient, the output will just stop for about an hour with no loading screen.
- You'll know the push completed when you get to

  ```txt
  [Build]   [main] Successfully tagged local_image_main:latest
  [Info]    Streaming device logs...
  ```

To view the output of the main container, you can do

- `balena ssh <hostname>`
- then inside that session, do `balena container ls` to get a list of running containers. the app
  is likely the latest created container which means is necessary for the next step to work
- Attach to the output of the main container with `balena attach $(balena container ls -lq)`

# Usage

## Run the server in development mode (refreshing on change)

```bash
yarn dev
```

## Run the server with arguments

get a list of command line options with

```bash
npx babel-node -- src/main.js -h
```

```txt
spi
      --spi-clockSpeed  SPI Clock speed to use for all devices
                                                     [number] [default: 3000000]
      --spi-mode        SPI Data mode to use for all devices
                                                           [number] [default: 0]
      --spi-channels    SPI Channel information (as JSON)
    [string] [default: "{"0": {"bus": 0, "device": 0}, "1": {"bus": 0, "device":
               1}, "2": {"bus": 1, "device": 0}, "3": {"bus": 1, "device": 1}}"]

pbx
      --pbx-ports     PBX Serial port definitions for js-pixelblaze-expander
      [string] [default: "{"0": {"name": "/dev/ttyS0", "options": {"channels": {
   "0": { "capacity": 300 }, "1": { "capacity": 300 }, "2": { "capacity": 300 },
      "3": { "capacity": 300 }, "4": { "capacity": 300 }, "5": { "capacity": 300
                                                                         }}}}}"]
      --pbx-channels  PBX channel definitions for js-pixelblaze-expander
        [string] [default: "{"0": { "port": 0, "channel": 0 }, "1": { "port": 0,
  "channel": 1 }, "2": { "port": 0, "channel": 2 }, "3": { "port": 0, "channel":
      3 }, "4": { "port": 0, "channel": 4 }, "5": { "port": 0, "channel": 5 }}"]

Options:
      --version             Show version number                        [boolean]
  -d, --devType             Type of device used
                                        [choices: "PBX", "SPI"] [default: "SPI"]
  -p, --port                port used to listen for OPC commands
                                                       [number] [default: 42069]
  -t, --transportProtocol   OSI Transport Layer protocol with which the server
                            will listen [choices: "TCP", "UDP"] [default: "UDP"]
  -m, --middlewareProtocol  Protocol used to translate colours before sending to
                            device
  [choices: "colours2sk9822", "colours2ws2811", "colours2ws2812", "colours2rgb"]
                                                     [default: "colours2sk9822"]
  -h, --help                Show help                                  [boolean]
```

so, if you wanted to use a different serial port, devType and middleware, you could do:

```bash
npx babel-node -- src/main.js -d PBX -m colours2rgb --pbx-ports '{"0": {"name": "/dev/tty.usbserial-AD025M69", "options": {"channels": { "0": { "capacity": 300 }, "1": { "capacity": 300 }, "2": { "capacity": 300 }, "3": { "capacity": 300 }, "4": { "capacity": 300 }, "5": { "capacity": 300 }}}}}'
```

If everything is working, you should see something like this:

```txt
🛰  UDP Server listening on port: 0.0.0.0:42069
```

# Quick test

Before setting up an OPC client such as [JS-Telecortex-2-Client](github.com/laserphile/js-telecortex-2-client), you can test that everything is working by running this command in a new terminal window on the pi:

```bash
printf "\x00\x00\x00\x03\x00\xff\x00" >/dev/udp/127.0.0.1/42069
printf "\x01\x00\x00\x03\x00\xff\x00" >/dev/udp/127.0.0.1/42069
printf "\x02\x00\x00\x03\x00\xff\x00" >/dev/udp/127.0.0.1/42069
printf "\x03\x00\x00\x03\x00\xff\x00" >/dev/udp/127.0.0.1/42069
#       |ch-|cmd|cmd_len|--colors--|
#         ^   ^       ^    ^
# ch: 3   '   |       |    |
# cmd: 0 (8bit RGB)   |    |
# cmd_len (uint16BE): 3B   |
# colours: 1 green pixel  /
```

This will send a UDP OPC message to localhost port 42069 that sets the first pixel on each channel (0-3) to green. For more info, Check out the [OPC protocol details](http://openpixelcontrol.org/)
