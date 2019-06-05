#!/usr/bin/env bash

deploy () {
  eval "$(ssh-agent -s)"
  echo -e ${BALENA_CLOUD_KEY} > id_rsa
  chmod 0600 id_rsa
  ssh-add ./id_rsa
  cat balenakey >> ~/.ssh/known_hosts
  git remote add balena ${BALENA_REMOTE}
#  git fetch --unshallow origin
  mv node_modules node_modules_new
  git add --all
  git commit -am "build" --allow-empty
  git push -f balena master
}

deploy
