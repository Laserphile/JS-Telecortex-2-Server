FROM balenalib/armv7hf-debian-node:11.6.0-latest-run
RUN sudo apt-get update && sudo apt-get upgrade
RUN sudo apt-get install -y zip \
      curl \
      apt-transport-https
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt-get update && apt-get install yarn
RUN sudo apt-get install -y python-dev python-tk python-numpy python3-dev python3-tk python3-numpy
RUN sudo apt-get install -y build-essential cmake
WORKDIR /usr/src/app
COPY . .
#RUN sudo ./build-server.sh
CMD ["/bin/bash", "-c", "ls -a"]
#CMD ["/bin/bash", "./start.sh"]
