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

		res = {
			_token: 'JNU^TFYTHGJNKHVKGC',
			success: true,
			err_msg: null,
			UserObj: 'obj'
		}

		io.emit(data._event, res)
	});

	socket.on('user.register', function(data){

		returnObject = {
			success: true,
			err_msg: null
		}

		user = new models.User({ name: data.name, disp_name: data.name ,password: data.password});
		user.save(function (err, user) {
				if (err){
						returnObject.success = false,
						returnObject.err_msg = err
				}else{
						console.log("New User %s is CREATED", user.name);
					//	returnObject.err_msg = "New User"+ user.name +"is CREATED";
				}
		});

		io.emit(data._event, returnObject)
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

		returnObject = {
			success: true,
			err_msg: null
		}

		group = new models.Group({name:data.name});
		group.save(function (err, room) {
							if (err){
								returnObject.success = fault;
								returnObject.err_msg = err;
							}
							else{
								console.log("New Group %s is CREATED",room.name);
								//returnObject.err_msg = "New Group" + room.name+"is CREATED";
							}
		});

		io.emit(data._event, returnObject)
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
