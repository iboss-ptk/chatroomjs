# py-chatroom

### Tools and libraries

**Infrastructure**
* [Docker](https://www.docker.com/) : using container technology to share the same development environment with the team
* [Docker-compose](https://docs.docker.com/compose/) : define a multi-container application in a single file (Sure, we're going to use multi-container)

**Stack**
* [redis](http://redis.io/) : a data structure server which havepub/sub feature
* [MongoDB](http://www.mongodb.com/) : as the primary storage
* [Flask](http://flask.pocoo.org/) : a microframework for Python

> * [redis-py](https://github.com/andymccurdy/redis-py) : python client library for redis
> * [Flask-security](https://pythonhosted.org/Flask-Security/) : authentication, support mongoengine
> * [mongoengine](http://mongoengine.org/) : a Document-Object Mapper (think ORM, but for document databases) for working with MongoDB from Python.
> * [Flask-socketio](https://flask-socketio.readthedocs.org/en/latest/) : The client-side application can use the SocketIO to establish a permanent connection to the server.

* [socket.io](http://socket.io/) : for handling client-side websocket (javascript)

### Additional resources

* [Docker and deployment](https://www.amon.cx/blog/deploying-web-apps-docker/)
* [Docker dev env](http://matthewminer.com/2015/01/25/docker-dev-environment-for-web-app.html)
* [python-redis chatroom using pub/sub](http://programeveryday.com/post/create-a-simple-chat-room-with-redis-pubsub/)
* [flask redis](http://flask.pocoo.org/snippets/71/)
