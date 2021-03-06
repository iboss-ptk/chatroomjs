var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');
var extend = require('util')._extend;
var fs = require('fs');
var async = require('async');
var multer = require('multer');

mongoose.connect('mongodb://mongo/chat');
//mongoose.connect('mongodb://127.0.0.1:27017/chat');

var secret = "ZDKFHG98EIGLEHRVT30IHVPXCVSDJNFGHBS@@OOXCPO5U8"
var models = {
	User : require("./models/user").User,
	GroupMember : require("./models/group_member").GroupMember,
 	Group : require("./models/group").Group,
 	Message : require("./models/message").Message
}

var redis_client = redis.createClient(6379, 'redis');
//var redis_client = redis.createClient(6379, '127.0.0.1');

app.use(bodyParser.urlencoded());
app.use(multer());
app.use(express.static('assets'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	console.log('successfuly request');
});

app.post('/photo', function (req, res) {
	var token = req.body._token;
	console.log(req.body);

	async.waterfall([
		// jwt
		function (callback) {
			jwt.verify(token, secret, function (err, payload) {
				if (err) {
					res.status(400);
					res.send('wrong token');
					callback(err);
					return ;
				}
				callback(null, payload);
			});
		},

		// redis
		function (payload, callback) {
			redis_client.get(payload.session_id, function (err, UserObj) {
				if (err || UserObj === null) {
					res.status(400);
					res.send('expired_token');
					callback(err);
					return ;
				}
				callback(null, payload, JSON.parse(UserObj));
			});
		},

		// read
		function (payload, UserObj, callback) {
			fs.readFile(
				req.files.file.path,
				function (err, data) {
					if (err) {
						res.send({ error: 'cannot read the uploaded file' });
						callback(err);
						return ;
					}
					callback(null, payload, UserObj, data);
				});
		},

		// write
		function (payload, UserObj, data, callback) {
			var fileName = req.files.file.name;
			var extension = fileName.split('.').slice(-1)[0];
			var newFileName = UserObj.username + '.' + extension;
			var serverPath = 'assets/display_images/' + newFileName;

			fs.writeFile(serverPath, data, function (err) {
				if (err) {
					res.send({ error: 'cannot write file' });
					callback(err);
					return ;
				}

				// update UserObj
				UserObjNew = extend({}, UserObj);
				UserObjNew.display_image = newFileName;

				async.parallel({
					// update redis
					redis: function (finish) {
						redis_client.set(payload.session_id, JSON.stringify(UserObjNew), function (err) {
							if (err) {
								console.log('problem with updating UserObj on redis');
								finish(err, null);
								return ;
							}
							finish();
						});
					},
					// update mongo
					mongo: function (finish) {
						models.User.findOneAndUpdate(UserObj, UserObjNew, { upsert: true }, function (err, doc) {
							if (err) {
								console.log('problem with updating UserObj on mongo');
								finish(err, null);
								return ;
							}
							finish();
						});
					},
				}, function (err) {
					if (err) {
						console.log("cannot update database");
						callback(err);
						return;
					}
					console.log('successfully create a user with display image.');

					console.log("success !!!");
					res.json({
						success: true,
						UserObj: UserObjNew,
					});

					callback(null);

				});

			});
		},

	], function (err, results) {
		if (err) {
			console.log('err uploading image');
			return ;
		}
		console.log('results:', results);
	});

});

// load last sequence from mongo
// and update this to redis
models.Message.findOne().sort('-seq').exec(function (err, res) {
	if (err) {
		console.log('err', err);
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
			console.log('err', err);
			return ;
		}
		console.log('set message_sequence to :', latestSequence);
	});
});

io.on('connection', function(socket){
	// helper function is used to verify and get data from the user
	var helper = (function (){

		return {
			CreateToken: function (payload, callback) {
				var obj = {
					session_id: uuid.v4(),
				};

				// if the payload is not an object
				if (typeof payload !== 'object' || payload === null) {
					payload = {};
				}

				// add to redis
				redis_client.set(obj.session_id, JSON.stringify(payload), function (err, success) {
					if (err) {
						console.log('error while creating token');
						return ;
					}
					var token = jwt.sign(obj, secret, { expiresInMinutes: 60*24*2 });
					callback(token);
				});
			},

			Set: function (obj) {
				throw new Error('deprecated');
			},

			GetSessionId: function (data, callback) {
				jwt.verify(data._token, secret, function (err, payload) {
					if (err) {
						// wrong token
						callback(err);
						return console.log(err);
					}
					callback(null, payload.session_id);
				});
			},

			IsLogin: function (data, callback, emit) {
				console.log('is login as been called:', data);
				// default
				emit = emit || true;

				jwt.verify(data._token, secret, function (err, payload) {
					if (err) {
						// wrong token
						if (emit) {
							socket.emit(data._event, {
								success: false,
								err_msg: [ 'wrong_token' ],
							});
						}
						return console.log(err);
					}
					console.log('payload:', payload);
					// use payload to get the information from redis
					redis_client.get(payload.session_id, function (err, UserObj) {
						// problem getting this entry,
						// or the entry is empty
						console.log('before:');
						console.log(UserObj);
						console.log(typeof UserObj);
						if (err || UserObj === null) {
							if (emit) {
								socket.emit(data._event, {
									success: false,
									err_msg: ['expired_token'],
								});
							}
							return console.log('error while getting session from redis');
						}
						// this should return UserObj
						UserObj = JSON.parse(UserObj);
						console.log('after:', UserObj);
						callback(UserObj);
					});
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

				helper.CreateToken(UserObj, function (token) {

					res.success = true;
					res.UserObj = UserObj;
					res._token = token;

					socket.emit(data._event, res);
				});

			}else if(loginResult === 'authen_failed'){
				res.success = false;
				res.err_msg = err;
				socket.emit(data._event, res);
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
			socket.emit(data._event, res);
		});
	});


	socket.on('user.join', function(data){
		helper.IsLogin(data, function (UserObj) {
			var res = {};

			//FIND USEROBJECT
			models.User.findOne(UserObj,function(err,results){
				if(results){
					//GOT USER OBJ => get him in da group
					results.getInGroup(data.group_name,function(returnMessage){
						res.err_msg = [returnMessage];
						console.log(res.err_msg);
						res.GroupObj = {
							group_name: data.group_name,
						};
						if(returnMessage == 'already_exists'){
							res.success = false;
							//console.log("YOU JOINED Groups = > already_exists");
						}else if(returnMessage == 'success'){
							res.success = true;
							console.log('FIRST TIME JOINING = > CREATE MEMBER ENTITY FOR : "'+UserObj.username+ '" IN : '+data.group_name);
						}else if(returnMessage == 'group_not_found'){
							res.success = false;
							//console.log("GROUP NOT FOUND");
						}else{
							res.success = false;
							//console.log('unhandled error');
						}
						// join him to this group
						socket.join(data.group_name);
						// return the value
						socket.emit(data._event, res); // SUCCESS
					});
				}
				else {
					res.success = false;
					socket.emit(data._event, res);
				}
			});
		});
	});

	socket.on('user.leave', function(data){
		helper.IsLogin(data, function (UserObj) {
			var res = {
									success: true,
									err_msg: null
			};
			// find specific User
			models.User.findOne(UserObj,function(err,results){
				console.log(UserObj.username+" ASK TO LEAVE "+data.group_name );
				if(results){
					//leave the user
					results.leave(data.group_name,function(msg,parse){
						if(msg == 'success'){
							console.log(UserObj.username+" SUCCESSFULLY LEAVE "+data.group_name );
								res.success = true;
								//res.err_msg = [msg];
							}else{
								res.success = false;
								res.err_msg = ['no_group_name'];
							}
							socket.emit(data._event, res);
					});
				}else{
					res.success = false;
					res.err_msg = ['no_user'];
					socket.emit(data._event, res);
				}
			});
		});
	});

	socket.on('user.pause', function(data){
		console.log("SOME1 TRY TO PAUSE");
		console.log(data);
		helper.IsLogin(data, function (UserObj) {
			var res = {};
			models.User.findOne({username: UserObj.username},function(err,user){
				res.err_msg = []
				if(err){
					res.err_msg.push("can not find user. who the hell are you?");
					res.success = false;
					socket.emit(data._event, res);
				} else {
					user.pause(data.group_name, function(err,results){
						if(err) {
							res.err_msg.push(err);
						}
						res.success = results.success;
						socket.emit(data._event, res);
					});
				}
			});
		});
	});

	socket.on('user.logout', function(data){
		helper.IsLogin(data, function (UserObj) {
			// logout code here
			// since we don't use redis anymore
			// logout can be done entirely at the frontend
			returnObj = {
				success: true,
				err_msg: []
			}

			helper.GetSessionId(data, function (err, session_id) {

				redis_client.del(session_id, function(err, res){
					if (err) {
						returnObj.success = false;
						returnObj.err_msg.push('Can not logout. Error occured at redis.');
						console.log('cannot logout, Erorr occured at redis');
					}
					socket.emit(data._event, returnObj);
				});

			});

		});

	});

	socket.on('user.get_groups', function (data) {
		helper.IsLogin(data, function (UserObj) {
			var res = {
					success : true ,
					GroupObjList : []
			};
			console.log('user.get_group has been called ', UserObj);
			models.User.findOne(UserObj,function(err,results){
				if(results){
					results.get_groups(function(groupList){
						res.GroupObjList = groupList;
						console.log(res.GroupObjList);

						// join him the the groups in the list
						groupList.forEach(function (group) {
							socket.join(group.group_name);
						});
						// return the value
						socket.emit(data._event,res);
					});
				}else{
					//CANNOT FIND USER => CANT GET GROUP
					console.log('results', results);
					res.success = false;
					socket.emit(data._event,res);
				}
			});
		});
	});


	//group handler

	socket.on('group.create', function(data){
		helper.IsLogin(data, function (UserObj) {

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
				//console.log("Cant Create Group :"+data.group_name+" "+err);
					console.log(res.err_msg);
				}

				socket.emit(data._event, res);

			});
		});
	});


	//message handler

	socket.on('message.send', function(data){
		helper.IsLogin(data, function (UserObj) {
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

	socket.on('message.get_unread', function (data) {
		helper.IsLogin(data, function (UserObj) {
			res = {
				unread_msg: [],
				success: true,
				err_msg: null
			};

			//Y U NOT FOUND U MOTHERFUCKING SHIT
			models.Message.getunreadmsg(data, UserObj , function(msg, unreadResults) {
				if(unreadResults == 'unexpected') {
			 		//Failed to function properly
			 		res.success = false;
			 		res.err_msg = 'unexpected';
			 	} else if(msg == 'ok'){
			 		//mikotodesu~
					res.success = true;
			 		res.unread_msg = unreadResults;
			 	} else {
					res.success = false;
					res.err_msg = 'unexpected';
				}
			 	socket.emit(data._event, res);
			});

		});

	});

	// this will return the requsted messages
	socket.on('message.get_message', function (data) {
		helper.IsLogin(data, function (UserObj) {

			models.Message
				.find({
					group_name: data.group_name,
					seq: {
						$lt: data.start_seq,
					},
				})
				.sort('-seq')
				.limit(data.limit)
				.exec(function (err, docs) {
					if (err) {
						console.log('err', err);
						return ;
					}

					// return the result
					socket.emit(data._event, {
						success: true,
						MessageObjList: docs,
					});
				});

		});
	});

	socket.on('disconnect', function () {
		// pause all group if token is valid
	});

});


http.listen(8888, function(){
	console.log('listening on port 8888');
});
