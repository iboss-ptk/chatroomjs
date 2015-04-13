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

Breifly, the idea is Docker&Compose for infrastructure; Git for source code; npm for js dependencies.

After you have downloaded all of the tools, it's time to begin.

First, you have to clone this repo into your computer.
```sh 
   $ cd path/to/your/workspace
   $ git clone https://github.com/iboss-ptk/chatroomjs.git
```

Then run install the dependencies.
```sh 
   $ cd chatroomjs
   $ sudo npm install
```

Boot2docker is a small Linux vm. So, if you are using Linux, this is not needed. If you're not, you have to boot the vm and enable docker command to run outside on your host os.
```sh 
   $ boot2docker init # only for the first time
   $ boot2docker up
   $ boot2docker shellinit
```

And execute this command from the root directory of this repo.
```sh
   $ docker-compose up
```

Every component should work at this point. If you have any issue, feel free to ask me. If you're using windows, I can't help you much so I'd like to suggest you to use any Linux distro or OSX.

### Additional resources

* [Docker and deployment](https://www.amon.cx/blog/deploying-web-apps-docker/)
* [Docker dev env](http://matthewminer.com/2015/01/25/docker-dev-environment-for-web-app.html)
* [Multi chatroom tutorial](http://psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/)
* [Docker cheat sheet](https://github.com/wsargent/docker-cheat-sheet)
