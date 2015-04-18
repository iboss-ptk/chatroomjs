var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/chat');

var models = {
	User: require("./models/user").User
, GroupMember : require("./models/group_member").GroupMember
, Group : require("./models/group").Group
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
		console.log("USER LOGIN CALLED");
		res = {
			_token: 'JNU^TFYTHGJNKHVKGC',
			success: true,
			err_msg: null,
			UserObj: 'obj'
		}
		models.User.login(data,function(err,res){
			console.log(res);
			io.emit(data._event, res)
		});
		// io.emit(data._event, res)

	});

	socket.on('user.register', function(data){
		console.log("USER REGISTER CALLED");

			res = {
				success: true,
				err_msg: null
			}
				models.User.register(data,function(err,res){
					io.emit(data._event, res)
				});

		});


	socket.on('user.join', function(data){

		res = {
			success: true,
			err_msg: null
		}

		//CREATE GROUPMEMBER ENTITY HERE

		io.emit(data._event, res)
	});

	socket.on('user.leave', function(data){

		res = {
			success: true,
			err_msg: null
		}

		//DELETE GROUPMEMBER ENTITY

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
		console.log(data)
		res = {
			success: true,
			err_msg: null
		}

		console.log("GROUP REGISTER CALLED");
		models.Group.create(data,function(err,res){
			io.emit(data._event, res)
		});

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
