var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

mongoose.connect('mongodb://mongo/chat');

var secret = "ZDKFHG98EIGLEHRVT30IHVPXCVSDJNFGHBS@@OOXCPO5U8"
var models = {
	User: require("./models/user").User,
	GroupMember : require("./models/group_member").GroupMember,
 	Group : require("./models/group").Group
}

app.use(express.static('assets'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	console.log('successfuly request');
});

io.on('connection', function(socket){

	var redis_client = redis.createClient(6379, 'redis');

	var validateToken = function(callback){
		redis_client.get(socket.username + ":token", function(err, user_token){
			jwt.verify(user_token, secret, function(err, decoded) {
				redis_client
				if (err) return console.log(err);
				callback(err, decoded);
			});
		})
	}

	//user handler

	socket.on('user.login', function(data){

		var token = jwt.sign(data, secret, { expiresInMinutes: 60*24*2 });
		redis_client.set( data.username + ":token",token , function(err, res) {

			socket.username = data.username

			var returnObj = {
				_token: token,
				success: err ? false : true,
				err_msg: err,
				UserObj: 'obj'
			}

			console.log(returnObj);
			redis_client.get(data.username + ":token", function(err, res){
				console.log(res);
			});
			io.emit(data._event, returnObj)
		})
	});

	socket.on('user.register', function(data){

		var returnObj = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, returnObj)
	});

	socket.on('user.join', function(data){
		validateToken(function(err, decoded){
			socket.join(data.group_name);
			console.log('join ' + data.group_name);
			var returnObj = {
				success: err ? false : true,
				err_msg: err
			}

			// console.log(returnObj);
			io.emit(data._event, returnObj)
		})
		

	});

	socket.on('user.leave', function(data){

		returnObj = {
			success: true,
			err_msg: null
		}


		io.emit(data._event, returnObj)

	});

	socket.on('user.pause', function(data){

		returnObj = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, returnObj)
	});

	socket.on('user.logout', function(data){

		returnObj = {
			success: true,
			err_msg: null
		}

		io.emit(data._event, returnObj)
	});


	//group handler

	socket.on('group.create', function(data){


		returnObj = {

			success: true,
			err_msg: null
		}

		io.emit(data._event, returnObj)
	});	


	//message handler

	socket.on('message.send', function(data){
		validateToken(function(err, decoded){
			var returnObj = {
				success: true,
				user: decoded.username,
				_event: data._event,
				content: data.content,
				group_name: data.group_name,
				err_msg: null
			}
			console.log(returnObj);
			io.to(data.group_name).emit(data._event, returnObj)
		});
	});	

	socket.on('message.get_unread', function(data){

		returnObj = {
			unread_msg: [],
			success: true,
			err_msg: null
		}

		io.emit(data._event, returnObj)
	});	
		
});


http.listen(8888, function(){
	console.log('listening on *:8888');
});
