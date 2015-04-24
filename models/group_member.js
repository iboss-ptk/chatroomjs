var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = require("../models/user").User
var Group	= require("../models/group").Group


var GroupMemberSchema = new mongoose.Schema({
	user_id:  {type : Schema.Types.ObjectId , ref : User , index : true} ,
	group_id: {type : Schema.Types.ObjectId , ref : Group, index : true} ,
	last_seen :{type : Date , default:Date.now}
});

//CREATE GROUP MEMBER SCHEMA
GroupMemberSchema.statics.create = function(data,callback){
	console.log("Try To Create GroupMemberSchema");
	var resolved_group_id = 0;
	//FIND GROUP BY data.group_name
	Group.findOne({group_name:data.group_name},function(err,results){
		console.log(results);
		if(!results){
			callback('group_not_found');
		}else{
			resolved_group_id = results._id;
			//GOT resolved_group_id
			groupMember = new GroupMember(
				{
					user_id  : data.user_id ,
					group_id : mongoose.Types.ObjectId(resolved_group_id)
				});
			//console.log(groupMember);
			groupMember.save(function(err){
				if(err){
					//return unhandled error
					callback('already_exists');
				}else{
					//SUCCESS SAVED
					callback("group_member_created");
				}
			});
		}
	});


}


var GroupMember = mongoose.model('GroupMember', GroupMemberSchema);

GroupMemberSchema.pre("save", function(next) {
	GroupMember.findOne({group_id : this.group_id , user_id:this.user_id },'group_id', function(err, results) {
		if(err) {
			next(err);
		} else if(results) {
			next(new Error("duplicated_groupMember"));
		} else {
			next();
		}
	});
});


module.exports = {
	GroupMember: GroupMember
}
