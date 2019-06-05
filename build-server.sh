#!/usr/bin/env bash

build () {
  echo "Installing dependencies..."
  rm -rdf node_modules
  grep -v "opencv4nodejs" package.json > temp && mv temp package.json
  yarn
  cat pi-spi-build-patch.js > node_modules/pi-spi/index.js
  echo "Building..."
  npm run build-server
  echo "Cleaning up..."
  sudo find node_modules -maxdepth 1  -type d -not -name 'pi-spi' -maxdepth 1 -exec rm -rdf {} +
  sudo find . -maxdepth 1  -type d -not -name 'node_modules' -not -name 'built-server' -not -name '.' -exec rm -rdf {} +
  ls
}

build