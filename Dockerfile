FROM node:0.10-onbuild

ADD . /src
WORKDIR /src

RUN npm install -g nodemon

EXPOSE 8888