var mongoose = require("mongoose");

var GroupMember	= require("../models/group_member").GroupMember
var Group	= require("../models/group").Group

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	disp_name : String ,
	password : String
});

UserSchema.methods.listGroup = function listGroup (callback){
	//return this.model('Animal').find({ type: this.type }, callback);

	//callback(groupList);
}

UserSchema.methods.getInGroup = function getInGroup (group_name,callback) {
	var myDisplayName = this.disp_name;
	GroupMember.create({user_id:this._id, group_name:group_name},function(returnMessage){
		if(returnMessage == 'group_not_found'){
			callback('group_not_found');
		}else if(returnMessage == 'group_member_created'){
			callback('success');
		}else if(returnMessage == 'already_exists'){
			callback('already_exists');
		}
		else{
			//unhandled , another error which not handle
			callback('error');
		}
	});
}

//Register Function
UserSchema.statics.register = function(data, callback){
	user = new User({ username: data.username, disp_name: data.disp_name ,password: data.password});
	//Save After UserSchema.pre (please see UserSchema.pre)
	user.save(function (err, user) {
		if (err){
			//(FRONTEND MESSAGE , SERVER MESSAGE)
			callback('duplicated_username','error');
		}else{
			callback('okay','success');
		}
	});

}

//Login Function
UserSchema.statics.login = function(data,callback){
	User.findOne({username : data.username , password : data.password},{'username' :1 , 'disp_name':1}, function(err, results) {
		if(!results){
			callback(err,'authen_failed');
		}else{
			callback(results,'authen_success');
		}
	});
}

//After Define Function Then Packed it in modelSchema
var User = mongoose.model('User', UserSchema);

UserSchema.pre("save", function(next) {
	User.findOne({username : this.username},'username', function(err, results) {
		if(err) {
			//Another Error
			next(err);
		} else if(results) {
            //IF USER IS ALREADY CREATED

			//next(new Error("User Already Exists :" + results.username));
			next(new Error("duplicated_username"));

		} else {
			//DIDNT FIND ANYTHING GO AHEAD AND ADD NEW ROOM
			//NO ERROR INPUT TO NEXT
			next();
		}
	});
});

module.exports = {
	User: User
}
