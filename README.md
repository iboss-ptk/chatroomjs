# chatroomjs

### Tools and libraries

**Docker**
* [Docker](https://www.docker.com/) : using container technology to share the same development environment with the team
* [Docker-compose](https://docs.docker.com/compose/) : define a multi-container application in a single file (Sure, we're going to use multi-container)

**Application's Stack**
+ [Redis](http://redis.io/) : a data structure server which has pub/sub feature
+ [MongoDB](http://www.mongodb.com/) : as the primary storage
+ [Nodejs](https://nodejs.org/) : just nodejs
   - [Express](http://expressjs.com/) : web framework for Node.js
   - [mongoose](http://mongoosejs.com/) : mongodb object modeling for node.js
   - [socket.io](http://socket.io/) : real-time bidirectional event-based communication.
   - [noderedis](https://github.com/mranney/node_redis) : redis client

### Setting up

This project use Docker and Compose to orchestrate the application's infrastructure and Git to manage the code. So, you have to install all of those first. You can choose any git client as you prefer. [npm](https://www.npmjs.com/) is also needed in order to manage nodejs dependencies.

After you have downloaded all of the tools, it's time to begin.

First, you have to clone this repo into your computer.
```sh 
   $ cd path/to/your/workspace
   $ git clone https://github.com/iboss-ptk/chatroomjs.git
```

Then install the dependencies.
```sh 
   $ cd chatroomjs
   $ sudo npm install -g gulp && sudo npm install -g bower
   $ sudo npm install
   $ bower install
```
We might need to run docker command on the host os because it's easier to manage. If you're not on Linux, you need to run the following commands.
```sh 
   $ boot2docker init # only for the first time
   $ boot2docker up
   $ boot2docker shellinit
```
Then export DOCKER_HOST, DOCKER_CERT_PATH and DOCKER_TLS_VERIFY as it's shown after boot2docker up.

And run this command from the root directory of this repo.
```sh
   $ docker-compose up
```

Normally, boot2docker's ip is 192.168.59.103 so the application will be on http://192.168.59.103:8888. If this doesn't show anything, try running `` boot2docker ip `` to see your vm's ip. If you're on Linux, just http://localhost:8888.

Every component should work fine at this point. If you have any issue, feel free to ask me. If you're using windows, I can't help you much so I'd like to suggest you to use any Linux distro or OSX.

### Additional resources

* [Docker and deployment](https://www.amon.cx/blog/deploying-web-apps-docker/)
* [Docker dev env](http://matthewminer.com/2015/01/25/docker-dev-environment-for-web-app.html)
* [Multi chatroom tutorial](http://psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/)
* [Docker cheat sheet](https://github.com/wsargent/docker-cheat-sheet)
