var mongoose = require("mongoose");

var User = require("../models/user").User
var Group	= require("../models/group").Group

var GroupMemberSchema = new mongoose.Schema({
	user:  {type : String , ref : User} ,
	group_name: {type : String , ref : Group},
	last_seen :{type : Date , default:Date.now}
});

var GroupMember = mongoose.model('GroupMember', GroupMemberSchema);

module.exports = {
	GroupMember: GroupMember
}
