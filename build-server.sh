#!/usr/bin/env bash

build () {
  echo "Installing dependencies..."
  rm -rdf node_modules
  yarn
  cat pi-spi-build-patch.js > node_modules/pi-spi/index.js
  echo "Building..."
  npm run build
  echo "Cleaning up..."
  sudo find node_modules -maxdepth 1  -type d -not -name 'pi-spi' -maxdepth 1 -exec rm -rdf {} +
  sudo find . -maxdepth 1  -type d -not -name 'node_modules' -not -name 'built' -not -name '.' -exec rm -rf {} +
  ls
}

build