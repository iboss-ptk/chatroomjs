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
				if (err) return console.log(err);
				callback(err, decoded);
			});
		})
	}

	//user handler

	socket.on('user.login', function(data){
		var res = {};
		var token = jwt.sign(data, secret, { expiresInMinutes: 60*24*2 });

		models.User.login(data,function(err,loginResult){
			if(loginResult == 'authen_success'){
				res.success = true;
				res.UserObj = err;
				console.log(res);
				redis_client.set( data.username + ":token", token, function(err, redis_res) {
					redis_client.get(data.username + ":token", function(err, redis_token){
						socket.username = data.username;
						res._token = redis_token;
						console.log(res);
						io.emit(data._event, res);
					});

				});
			}else if(loginResult == 'authen_failed'){
				res.success = false;
				res.err_msg = err;
				io.emit(data._event, res)
			}
		});
	});

	socket.on('user.register', function(data){

		res = {
			success: true,
			err_msg: null
		}

		models.User.register(data,function(err,registerResult){
			if(registerResult == 'error'){
				var err_msg = [];
				err_msg.push(err);
				res.success = false;
				res.err_msg = err_msg;
				console.log(err_msg);
			}else if(registerResult == 'success'){
				res.success = true;

				console.log("User Register success");
			}
			io.emit(data._event, res);
		});
	});


	socket.on('user.join', function(data){
		validateToken(function(err, decoded){
			socket.join(data.group_name);
			console.log('trying to join ' + data.group_name);
			var res = {
				success: err ? false : true,
				err_msg: err
			}


			io.emit(data._event, returnObj);
		});


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

		io.emit(data._event, returnObj);
	});

	socket.on('user.logout', function(data){

		returnObj = {
			success: true,
			err_msg: []
		}

		redis_client.del(data.username + ":token", function(err, res){
			if (err) {
				returnObj.success = false;
				returnObj.err_msg.push('Can not logout. Error occured at redis.');
				console.log(res);
				io.emit(data._event, returnObj);
			}
		});

	});


	//group handler

	socket.on('group.create', function(data){
		res = {
			success: true,
			err_msg: null
		}

		models.Group.create(data,function(err,groupCreateResult){
			if(groupCreateResult == 'success'){
				res.success = true;
				console.log("New Group is Create name : "+data.group_name);
			}else if(groupCreateResult == 'failed'){
				res.success = false;
				res.err_msg = err;
				console.log("Cant Create Group :"+data.group_name+" "+err);
			}
			io.emit(data._event, res);
		});

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
			io.to(data.group_name).emit(data._event, returnObj);
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
