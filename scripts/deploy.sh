#!/usr/bin/env bash

set ex

deploy () {
  eval "$(ssh-agent -s)"
  if [ ! -d ~/.ssh ]; then
    mkdir -p ~/.ssh/
    chmod 700 ~/.ssh/
  fi
  echo -n ${BALENA_CLOUD_PRIVATE_KEY} > ~/.ssh/id_rsa_balena
  chmod 0600 ~/.ssh/id_rsa_balena
  echo -n ${BALENA_CLOUD_PUBLIC_KEY} > ~/.ssh/id_rsa_balena.pub
  chmod 0644 ~/.ssh/id_rsa_balena.pub
  cat ~/.ssh/id_rsa_balena | base64
  cat ~/.ssh/id_rsa_balena.pub | base64
  ssh-add ~/.ssh/id_rsa_balena
  cat >> ~/.ssh/known_hosts <<EOF
# ssh-keyscan git.balena-cloud.com
git.balena-cloud.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDknS0QO+2BmP4tVdUtveQ6P3vuj1AGpNkfb1DJO7rmUDx6sZHye7ODCWWE1bnmP+mJ93XTMaqQ1KCyA0WPTswx4wH8AW5C7zJ4ReKGXke5LmNaErLX9x0/AmuKymLS/kNce+CTabDNFJ575UW4uZCFzO2czMIhNd6EzPKVJJ8u7ArJbYd3IBCnMhCtwfAlhHfDVv6++dE5FlLnU//j8AkI2Ba5fjSKyFCBAIiJvajksk1T6Fcl3yd43PCUCyQ2D811QPlJqdthCBJm3V1//29rWqfHL5RVt+ybU29Yo03p7kU9You/obk+jCVT1FPrnWF9iqJK6XeHN8iuhRjhhzc7
git.balena-cloud.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBBnrdSJeg86z2daezUKsNyZyS4z5RMvr3BKdDrwg+Vu/StERePzR2StRpIsTdqE8RoAlLf/Jf4QNuvoXn6ECs0M=
git.balena-cloud.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA4OchSqB9uHW61eTdQdlayXRT+OmaIRGem5DMiDo3IK
EOF
  git remote add balena ${BALENA_REMOTE}
  git fetch --unshallow origin
  git commit -am "build" --allow-empty
  git push -f balena master
}

deploy
