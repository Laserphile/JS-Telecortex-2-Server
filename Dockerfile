FROM balenalib/armv7hf-debian-node:11.6.0-latest-run
RUN sudo apt-get update && sudo apt-get upgrade
RUN sudo apt-get install -y zip \
      curl \
      apt-transport-https
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt-get update && apt-get install yarn
WORKDIR /usr/src/app
COPY . .
RUN sudo ./build-server.sh
CMD ["/bin/bash", "./start.sh"]
