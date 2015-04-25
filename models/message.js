var mongoose = require("mongoose");

var GroupMember	= require("../models/group_member").GroupMember
var Group = require("../models/group").Group

var MessageSchema = new mongoose.Schema({
 	content: String,
 	username: String,
 	group_name: String,
 	seq: Number,
 	sent_at: Date
});

//why ??
MessageSchema.statics.getunreadmsg = function (data, userObj ,callback) {
	console.log(userObj.username + ' is calling get_unread');
	//find group id
	Group.findOne({group_name: data.group_name}, 'group_id', function (err, results) {
		if(results) {
			//find last_seen in group_members
			GroupMember.findOne({user_id:userObj._id, group_id:results}, 'last_seen', function(ret, res) {
				if(res) {
					console.log('last_seen at ' + res)
					var user_last_seen = new Date(res.last_seen);
					console.log('user_last_seen ' + user_last_seen);
					//find message before given last_seen
					Message.find({sent_at : { $gte : res.last_seen }}, function (msg, resData) {
						if(resData) {
							console.log(msg, 'unread message get !!');
							console.log(resData);
							callback('ok', resData);
						} else {
							console.log('error : null');
							callback(msg, 'unexpected');
						}
					});
				} else {
					console.log('dead : cannot find last_seen associated with user : ' + userObj.username + ' group : ' + data.group_name);
					callback(ret, 'unexpected');
				}
			});

		} else {
			console.log('dead : cannot find group_id');
			callback(err, 'unexpected');
		}
	});
}

var Message = mongoose.model('Message', MessageSchema);

module.exports = {
	Message: Message
}
