#!/usr/bin/env bash

build () {
  name="$(basename "$PWD")"
  echo "Installing dependencies for ${name}..."
  rm -rdf node_modules
  yarn
  cp 'pi-spi-build-patch.js' 'node_modules/pi-spi/index.js'

  echo "Building ${name} ..."
  npm run build
  echo "Cleaning up  for ${name} ..."
  build_dir="../${name}-build/"
  mkdir -p "${build_dir}/node_modules"
  cp -r 'node_modules/pi-spi' "${build_dir}/node_modules"
  cp 'start.sh' "$build_dir"
  cd '../' || return
    sudo rm -rdf "${name}.bak" \
    && mv "$name" "${name}.bak" \
    && mv "${name}-build" "$name"
  cd "$name" || return
  ls
}

if [ -n "$1" ]; then
  build
else
  echo "don't run this locally"
fi
