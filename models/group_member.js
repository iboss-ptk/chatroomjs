var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = require("../models/user").User
var Group	= require("../models/group").Group


var GroupMemberSchema = new mongoose.Schema({
	user:  {type : Schema.Types.ObjectId , ref : User} ,
	group_name: {type : Schema.Types.ObjectId , ref : Group},
	last_seen :{type : Date , default:Date.now}
});


GroupMemberSchema.statics.create = function(data,returnObject){
	console.log("Try To Create GroupMemberSchema");
	groupMember = new GroupMember({user:data.name ,group_name:data.group_name });
	groupMember.save(function(err,_group){
		if(err){
			returnObject.success = false,
			returnObject.err_msg = err
			console.log(user)
			console.log(group_name)
			console.error(err);
		}else{
			console.log("GroupMemberEntity Created",_group);
			returnObject.success = true;
		}
	});
}


var GroupMember = mongoose.model('GroupMember', GroupMemberSchema);

module.exports = {
	GroupMember: GroupMember
}
