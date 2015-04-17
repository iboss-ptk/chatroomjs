var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/chat');

var models = {
	User: require("./models/user").User
} 

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

	//user handler

	socket.on('user.login', function(data){

		res = {
			_token: 'JNU^TFYTHGJNKHVKGC',
			success: true,
			err_msg: null,
			UserObj: 'obj'
		}

		io.emit(data._event, res)
	});

	socket.on('user.register', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});

	socket.on('user.login', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});

	socket.on('user.join', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});

	socket.on('user.leave', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});

	socket.on('user.pause', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});

	socket.on('user.logout', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});


	//group handler

	socket.on('group.create', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});	


	//message handler

	socket.on('message.send', function(data){

		res = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});	

	socket.on('message.get_unread', function(data){

		res = {
			unread_msg: [],
			success: true,
			err_msg: null
		}

		io.emit(data._event, res)
	});	
		

});


http.listen(8888, function(){
	console.log('listening on *:8888');
});