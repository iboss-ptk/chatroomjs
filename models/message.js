var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
  content: String,
  username: String,
  group_name: String,
  seq: Number,
  sent_at: Date,
});

var Message = mongoose.model('Message', MessageSchema);

MessageSchema.methods.get_unread = function get_unread (data, UserObj, callback) {
	console.log(UserObj.username + ' is calling get_unread');
	//find group id
	Group.findOne({group_name: data.group_name}, 'group_id', function (err, results) {
		if(results) {
			//find last_seen in group_members
			GroupMember.findOne({_id:UserObj._id, group_id:results} 'last_seen', function(ret, res) {
				if(res) {
					console.log('last_seen at ' + res)
					var user_last_seen = res;
					//find message before given last_seen
					Message.find({sent_at : { $gte : res }}).sort({ send_at : -1 }, function (msg, resData) {
						if(resData) {
							console.log('unread message get !!');
							console.log(resData);
						} else {
							console.log('no unread message');
						}
					});
				} else {
					console.log('daed : cannot find last_seen associated with user : ' + UserObj.username + ' group : ' + group_name);
				}
			});

		} else {
			console.log('dead : cannot find group_id');
			//callback
		}
	});

}

module.exports = {
	Message: Message
}
