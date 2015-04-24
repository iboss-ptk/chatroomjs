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

	// var validateToken = function(token, callback){
	// 	jwt.verify(token, secret, function(err, decoded) {
	// 		//
	// 		if (err) return console.log(err);

	// 	});
	// }

	var helper = (function (){
		var data = null;

		return {
			SetData: function (_data) {
				data = _data;
			},

			IsLogin: function (callback) {
				jwt.verify(data._token, secret, function (err, payload) {
					if (err) {
						// wrong token
						socket.emit(data._event, {
							success: false,
							err_msg: [ 'wrong_token' ],
						});
						return console.log(err);
					}
					callback(payload);
				});
			},
		}
	}());

	//user handler

	socket.on('user.login', function(data){
		var res = {};

		models.User.login(data,function(err,loginResult){
			if(loginResult == 'authen_success'){
				var UserObj = err;
				// the token contains only an instance of UserObj
				var sessionToken = jwt.sign(UserObj, secret, { expiresInMinutes: 60*24*2 });

				res.success = true;
				res.UserObj = UserObj;
				res._token = sessionToken;

				console.log(res);
				// redis_client.set( data.username + ":token", token, function(err, redis_res) {
				// 	redis_client.get(data.username + ":token", function(err, redis_token){
				// 		socket.username = data.username;
				// 		res._token = redis_token;
				// 		console.log(res);
				// 		io.emit(data._event, res);
				// 	});

				// });
			}else if(loginResult == 'authen_failed'){
				res.success = false;
				res.err_msg = err;
			}

			io.emit(data._event, res);
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
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			var res = {};

			//FIND USEROBJECT
			models.User.findOne({username:UserObj.username},function(err,results){
				if(results){
					//GOT USER OBJ => get him in da group
					results.getInGroup(data.group_name,function(returnMessage){
						res.err_msg = [returnMessage];
						if(returnMessage == 'already_exists'){
							res.success = false;
							console.log("YOU JOINED Groups = > already_exists");
						}else if(returnMessage == 'success'){
							res.success = true;
							console.log('succesfull joining and create member entity');
						}else{
							res.success = false;
							console.log('unhandled error');
						}
						io.emit(data._event, res); // SUCCESS
					});
				}
			});
		});
	});

	socket.on('user.leave', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			// leaving code here !

			io.emit(data._event, {
				success: true,
				err_msg: null,
			});
		});
	});

	socket.on('user.pause', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			// user pause code here!

			io.emit(data._event, {
				success: true,
				err_msg: null,
			});
		});
	});

	socket.on('user.logout', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			// logout code here
			// since we don't use redis anymore
			// logout can be done entirely at the frontend
			returnObj = {
				success: true,
				err_msg: []
			}

			io.emit(data._event, returnObj);

			// redis_client.del(data.username + ":token", function(err, res){
			// 	if (err) {
			// 		returnObj.success = false;
			// 		returnObj.err_msg.push('Can not logout. Error occured at redis.');
			// 		console.log(res);
			// 		io.emit(data._event, returnObj);
			// 	}
			// });

		});

	});

	socket.on('user.get_group', function (data) {
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {

			socket.emit(data._event, {
				success: true,
				GroupObjList: [],
			});

		});
	});


	//group handler

	socket.on('group.create', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {

			res = {
				success: true,
				err_msg: null
			}

			models.Group.create(data,function(err,groupCreateResult){
				var UserObj;
				if(groupCreateResult == 'success'){
					res.success = true;
					console.log("New Group is Create name : "+data.group_name);
				}else if(groupCreateResult == 'failed'){
					res.success = false;
					res.err_msg = ['already_exists'];
					console.log("Cant Create Group :"+data.group_name+" "+err);
				}
				io.emit(data._event, res);
			});

		});

	});


	//message handler

	socket.on('message.send', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {

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

		helper.SetData(data);
		helper.IsLogin(function (UserObj) {

			returnObj = {
				unread_msg: [],
				success: true,
				err_msg: null
			};

			io.emit(data._event, returnObj);
		});

	});

});


http.listen(8888, function(){
	console.log('listening on *:8888');
});
