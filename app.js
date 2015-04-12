var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
// var mongoose = require('mongoose');

// db = mongoose.createConnection('mongo', 'test', 27017)

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function (callback) {
//   console.log('yay!');
// });

// var clientList = []

function createPubSubClient(){
	var psClient = clientList.push( redis.createClient(6379, 'redis')-1 );
	return clientList[psClient]
}

app.use(express.static('assets'));

app.get('/', function(req, res){
	// var room = req.param('room');

	res.sendFile(__dirname + '/index.html');
	console.log('successfuly request');
});

io.on('connection', function(socket){
	socket.on('addRoom', function(room){
		socket.join(room);
		socket.room = room;
	});

	socket.on('chatmsg', function(msg){
		io.to(socket.room).emit('chatmsg', msg);
	});
});


http.listen(8888, function(){
	console.log('listening on *:8888');
});