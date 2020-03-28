#!/usr/bin/env bash

build () {
  echo "Installing dependencies..."
  rm -rdf node_modules
  yarn
  cat pi-spi-build-patch.js > node_modules/pi-spi/index.js
  echo "Building..."
  npm run build
  echo "Cleaning up..."
  cd node_modules && sudo find . -maxdepth 1  -type d -not -name 'pi-spi' -not -name '.' -not -name '..' -maxdepth 1 -exec rm -rf {} + && cd ..
  sudo find . -maxdepth 1  -type d -not -name 'node_modules' -not -name 'built' -not -name '.' -exec rm -rdf {} +
  sudo find . -maxdepth 1  -type f -not -name 'start.sh' -exec rm -rdf {} +
  ls
}

if [ -n "$1" ]; then
  build
else
  echo "don't run this locally"
fi
