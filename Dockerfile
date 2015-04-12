FROM node:0.10-onbuild

ADD . /src
WORKDIR /src

EXPOSE 8888