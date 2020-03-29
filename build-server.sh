#!/usr/bin/env bash

set -ex

build() {
  rm -rdf node_modules
  yarn --network-timeout 100000
  cp 'pi-spi-build-patch.js' 'node_modules/pi-spi/index.js'
  yarn build
  ls -al
}

if [ -n "$1" ]; then
  build
else
  echo "don't run this locally"
fi
