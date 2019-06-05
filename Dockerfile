FROM vanbujm/moonbase-balena:v0.1.0
WORKDIR /usr/src/app
COPY . .
RUN sudo ./build-server.sh
CMD ["ls", "-a"]
#CMD ["/bin/bash", "./start.sh"]
