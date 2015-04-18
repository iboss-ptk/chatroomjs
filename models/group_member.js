var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = require("../models/user").User
var Group	= require("../models/group").Group

var GroupMemberSchema = new mongoose.Schema({
	user:  {type : Schema.Types.ObjectId , ref : User} ,
	group_name: {type : Schema.Types.ObjectId , ref : Group},
	last_seen :{type : Date , default:Date.now}
});

var GroupMember = mongoose.model('GroupMember', GroupMemberSchema);

module.exports = {
	GroupMember: GroupMember
}
