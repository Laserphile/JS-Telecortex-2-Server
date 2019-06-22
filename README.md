```

  ______________    ________________  ____  _____________  __    ________
 /_  __/ ____/ /   / ____/ ____/ __ \/ __ \/_  __/ ____/ |/ /   /  _/  _/
  / / / __/ / /   / __/ / /   / / / / /_/ / / / / __/  |   /    / / / /
 / / / /___/ /___/ /___/ /___/ /_/ / _, _/ / / / /___ /   |   _/ /_/ /
/_/ /_____/_____/_____/\____/\____/_/ |_| /_/ /_____//_/|_|  /___/___/


```
A rewrite of the [Telecortex](https://github.com/laserphile/telecortex) project in NodeJS which controlls APA102/SK9822 LED strips over OPC

[![Build Status](https://travis-ci.org/Laserphile/JS-Telecortex-2-Server.svg?branch=master)](https://travis-ci.org/Laserphile/JS-Telecortex-2-Server)
[![Maintainability](https://api.codeclimate.com/v1/badges/ef74b26938c3f747b39f/maintainability)](https://codeclimate.com/github/Laserphile/JS-Telecortex-2-Server/maintainability)
[![codecov](https://codecov.io/gh/Laserphile/JS-Telecortex-2-Server/branch/master/graph/badge.svg)](https://codecov.io/gh/Laserphile/JS-Telecortex-2-Server)
[![Known Vulnerabilities](https://snyk.io/test/github/Laserphile/JS-Telecortex-2-Server/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Laserphile/JS-Telecortex-2-Server?targetFile=package.json)

## Gifs!

<img src="img/telecortex-timecrime-djing-short.gif?raw=true"><img src="img/telecortex-inside-dome.gif?raw=true">

[Video of Steamed Hams on a previoius version of TeleCortex](https://www.youtube.com/watch?v=OHrLvZHOcns)

## Coverage

![codecoverage-svg-sunburst]( https://codecov.io/gh/Laserphile/JS-Telecortex-2/branch/master/graphs/sunburst.svg)

## RaspberryPi Setup

We've created a docker image that sets up your Raspberry Pi 3B+ as an Open Pixel Control server with 4 SPI ports. The docker image is designed to run on [BalenaOS](https://www.balena.io/os/). This is the recommended way of using TeleCortex if you don't need to do deveopment on the server. Otherwise, there's a lot of messing around required.

### Option 1: Balena Cloud (Recommended)

Sign up for [BalenaCloud](https://www.balena.io/cloud/) (it's free!) and set up an application. Use its wizard to make an image with your network details.

Or you can download and configure your own image as long as it runs docker. Head over to https://www.balena.io/os/#download and get yourself a BalenaOS image.

Once the Pi(s) is running you can push an image to it by following the instructions [below](#balena-dev-setup)

### Option 2: Download and run directly on Raspbian

With a fresh install of raspbian lite, get your raspiberry pi configured with the correct locale using `raspi-config`. Optionally, while you're there you may wish to enable SSH, set the correct WiFi country, change the root password, and set a unique hostname.

#### Enable all 4 SPI ports on raspberry pi
(this can be done by editing the file on the SD card, or while the pi is on)
As root, add the lines
```
dtparam=spi=on # this one is not necessary if you've already enabled it in raspi-config
dtoverlay=spi1-2cs
```
to `/boot/config.txt` and reboot.
For more options (e.g. 5 SPI devices) and pinouts see `/boot/overlays/README`.

To test, `ls /dev | grep spidev` should show
```
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
*If you have an Armv7 or later Pi: (Model 2B, 3\*)*
If you just run `sudo apt-get install nodejs` you will get an old version of node. We want version 11.
```bash
# install node 11
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
```
*If you have an Armv6 Pi: (Model A\*, B\*, Zero)*
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
- `sudo balena local scan`
Get the ip address of the device you want to push to from the output.
- `sudo balena push 192.168.1.120` or whatever the IP is.

# Usage

## Run the server (the raspberry pi) in development mode (refreshing on change)

```
yarn dev
```
