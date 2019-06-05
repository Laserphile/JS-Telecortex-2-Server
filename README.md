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

## Coverage

![codecoverage-svg-sunburst]( https://codecov.io/gh/Laserphile/JS-Telecortex-2/branch/master/graphs/sunburst.svg)

## RaspberryPi Setup
Sign up for [BalenaCloud](https://www.balena.io/cloud/) and set up an application. Use its wizard to make an image with 
your network details. 

Or you can download and configure your own image as long as it runs docker. Head over to https://www.balena.io/os/#download and get yourself a BalenaOS image.

Once the Pi(s) is running you can push an image to it by following the instructions [below](#balena-dev-setup)

## OSX setup
This will not run on OSX. You need spidev for pi-spi to work 

### Balena dev setup
If you want to push to your pi without going through the pipeline. Make sure you also "enable local mode" on BalenaCloud if its a cloud image.
- `npm install --global --production --unsafe-perm balena-cli`
- `sudo balena local scan`
Get the ip address of the device you want to push to from the output.
- `sudo balena push 192.168.1.120` or whatever the IP is.

# Usage

#### Run the server (the raspberry pi) in development mode (refreshing on change)

```
yarn dev
```
