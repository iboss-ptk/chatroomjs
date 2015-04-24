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
 	Group : require("./models/group").Group,
 	Message: require('./models/message').Message,
}

var redis_client = redis.createClient(6379, 'redis');

app.use(express.static('assets'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	console.log('successfuly request');
});

// load last sequence from mongo
// and update this to redis
models.Message.findOne().sort('-seq').exec(function (err, res) {
	if (err) {
		throw new Error(err);
		return ;
	}
	// message not found
	if (!res) {
		return ;
	}
	console.log('the maximum is ', res);
	var latestSequence = res.seq;
	redis_client.set('message_sequence', latestSequence, function(err, res) {
		if (err) {
			throw new Error(err);
			return ;
		}
		console.log('set message_sequence to :', latestSequence);
	});
});

io.on('connection', function(socket){
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
				// 		socket.emit(data._event, res);
				// 	});

				// });

			}else if(loginResult == 'authen_failed'){
				res.success = false;
				res.err_msg = err;
			}

			socket.emit(data._event, res);
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
			socket.emit(data._event, res);
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
						res.GroupObj = {
							group_name: data.group_name,
						};
						if(returnMessage == 'already_exists'){
							res.success = false;
							//console.log("YOU JOINED Groups = > already_exists");
						}else if(returnMessage == 'success'){
							res.success = true;
							console.log('succesfull joining and create member entity');
						}else if(returnMessage == 'group_not_found'){
							res.success = false;
							//console.log("GROUP NOT FOUND");
						}else{
							res.success = false;
							//console.log('unhandled error');
						}
						console.log(res.err_msg);
						socket.emit(data._event, res); // SUCCESS
					});
				}
			});
		});
	});

	socket.on('user.leave', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			// leaving code here !

			socket.emit(data._event, {
				success: true,
				err_msg: null,
			});
		});
	});

	socket.on('user.pause', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			// user pause code here!

			socket.emit(data._event, {
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

			socket.emit(data._event, returnObj);

			// redis_client.del(data.username + ":token", function(err, res){
			// 	if (err) {
			// 		returnObj.success = false;
			// 		returnObj.err_msg.push('Can not logout. Error occured at redis.');
			// 		console.log(res);
			// 		socket.emit(data._event, returnObj);
			// 	}
			// });

		});

	});

	socket.on('user.get_groups', function (data) {
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			var res = {
					success : true ,
					GroupObjList : []
			};
			console.log('user.get_group has been called');
			models.User.findOne({username:UserObj.username},function(err,results){
				if(results){
					results.get_groups(function(groupList){
						res.GroupObjList = groupList;
						console.log(res.GroupObjList);
						socket.emit(data._event,res);
					});
				}else{
					//CANNOT FIND USER => CANT GET GROUP
					res.success = false;
					socket.emit(data._event,res);
				}
			});
		});
	});


	//group handler

	socket.on('group.create', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {

			res = {
				err_msg: null,
			}

			models.Group.create(data,function(err,groupCreateResult){

				if(groupCreateResult == 'success'){
					res.success = true;
					console.log("New Group is Create name : "+data.group_name);

				}else if(groupCreateResult == 'failed'){
					res.success = false;
					res.err_msg = ['already_exists'];
					console.log("Cant Create Group :"+data.group_name+" "+err);
				}

				socket.emit(data._event, res);

			});
		});
	});


	//message handler

	socket.on('message.send', function(data){
		helper.SetData(data);
		helper.IsLogin(function (UserObj) {
			console.log('messag send has been called !');
			var date = new Date();
			// get the latest id from redis
			// and increase it
			var sequence = null;
			redis_client.incr('message_sequence', function (err, seq) {
				sequence = seq;
				console.log('sequence: ', seq);

				// emit the message to every client in the room
				var message = {
					content: data.content,
					UserObj: UserObj,
					GroupObj: {
						group_name: data.group_name,
					},
					seq: sequence,
					sent_at: date,
				};
				console.log('sending message:', message);
				io.to(data.group_name).emit('message.receive', message);

				// save it to mongo
				models.Message.create({
					content: data.content,
					username: UserObj.username,
					group_name: data.group_name,
					seq: sequence,
					sent_at: date,
				}, function (err, res) {
					// save done

					// return this result to the caller
					console.log('finsihed!');
					socket.emit(data._event, {
						success: true,
						err_msg: null,
					});

				});

			});

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

			socket.emit(data._event, returnObj);
		});

	});


	socket.on('disconnect', function () {
		// pause all group if token is valid
	});

});


http.listen(8888, function(){
	console.log('listening on *:8888');
});
