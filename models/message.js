var mongoose = require("mongoose");

var GroupMember	= require("../models/group_member").GroupMember
var Group = require("../models/group").Group

var MessageSchema = new mongoose.Schema({
 	content: String,
 	username: String,
 	group_name: String,
 	seq: Number,
 	sent_at: Date,
});

var Message = mongoose.model('Message', MessageSchema);

//why ??
MessageSchema.statics.getunreadmsg = function (data, userObj, callback) {
	console.log(userObj.username + ' is calling get_unread');
	//find group id
	Group.findOne({group_name: data.group_name}, 'group_id', function (err, results) {
		if(results) {
			//find last_seen in group_members
			GroupMember.findOne({_id:userObj._id, group_id:results}, 'last_seen', function(ret, res) {
				if(res) {
					console.log('last_seen at ' + res)
					var user_last_seen = res;
					//find message before given last_seen
					Message.find({sent_at : { $gte : res }}).sort({ send_at : -1 }, function (msg, resData) {
						if(resData) {
							console.log('unread message get !!');
							console.log(resData);
							callback(resData);
						} else {
							console.log('no unread message');
							callback([]);
						}
					});
				} else {
					console.log('daed : cannot find last_seen associated with user : ' + userObj.username + ' group : ' + group_name);
					callback([]);
				}
			});

		} else {
			console.log('dead : cannot find group_id');
			callback([]);
		}
	});
}

module.exports = {
	Message: Message
}
