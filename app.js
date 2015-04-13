var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/chat');

var User = require("./models/user").User;

function createPubSubClient(){
	var psClient = clientList.push( redis.createClient(6379, 'redis')-1 );
	return clientList[psClient]
}

app.use(express.static('assets'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	console.log('successfuly request');
});

io.on('connection', function(socket){
	socket.on('addRoom', function(room){
		socket.join(room);
		socket.room = room;
	});

	socket.on('addUser', function(name){
		user = new User({ name: name, pic: 'pic' });
		console.log('add user')
		user.save(function (err, user) {
			if (err) return console.error(err);
			console.log("user is saved");
		});

		socket.name = name;
	});

	socket.on('chatmsg', function(msg){
		User.find(function(err, user){
			if (err) return console.error(err);
			console.log(user)
		});
		io.to(socket.room).emit('chatmsg', msg);
	});
});


http.listen(8888, function(){
	console.log('listening on *:8888');
});