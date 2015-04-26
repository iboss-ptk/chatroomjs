var mongoose = require("mongoose");

var GroupMember	= require("../models/group_member").GroupMember
var Group = require("../models/group").Group
var User = require("../models/user").User

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
					console.log('last_seen at ' + res.last_seen);
					//find message before given last_seen
					Message.find({sent_at : { $gte : res.last_seen }}, function (msg, resData) {
						if(resData) {
							console.log(resData.length + ' unread message get !!');
							//console.log('messages : ' + resData);
              var returnData = [];
              i = 0;
              resData.forEach(function(item) {
                User.findOne({username : item.username}, function (rep, userData) {
                  if(!userData) {
                    console.log("Dead : How can you not find an exist user !!?");
                    callback(rep, 'unexpected');
                  } else {
                    delete userData.password;

                    returnSchema = {
                      content : item.content,
                      username : item.username,
                      // group_name : item.group_name,
                      GroupObj: {
                        group_name: item.group_name,
                      },
                      seq : item.seq,
                      send_at : item.send_at,
                      UserObj: userData,
                      // user_id : userData._id,
                      // disp_name : userData.disp_name,
                      // display_image : userData.display_image
                    };
                    //console.log(returnSchema);
                    returnData.push(returnSchema);
                    i = i + 1;
                    if(i == resData.length) {
                      //console.log(returnData)
                      callback('ok', returnData);
                    }
                  }
                });
              });
              //console.log(returnData);
							//callback('ok', returnData);
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
