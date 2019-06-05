#!/usr/bin/env bash

grep -v "opencv4nodejs" package.json > temp
mv temp package.json
yarn --cache-folder /yarn-cache
