var mongoose = require("mongoose");

var GroupMember	= require("../models/group_member").GroupMember
var Group	= require("../models/group").Group

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	disp_name : String ,
	password : String,
	display_image : String
});

UserSchema.methods.pause = function pause(group_name,callback){
	console.log(this.username+" is trying to pause from group : "+group_name);
	var result = {};
	var group_id;
	var self=this;

	if(group_name === null){
		callback('just register',{success:true});
	}else{
		//console.log('else part');
	//Resolve Group_Name into Group-ID
	Group.findOne({group_name:group_name},function(err,group){
		if(group){
			//console.log(group);
			//console.log('the group id is : ',group_id);
			//console.log('the user id is : ',self._id);
			//console.log('Time is',Date.now());
			GroupMember.findOneAndUpdate({user_id:self._id,group_id:group._id},{last_seen:Date.now()},function(err,results){
				console.log("RESULT OF PAUSING : ")
				console.log(results);
				//console.log(JSON.stringify(results));
				callback(err,{success: err ? false : true});
				});
		}
	});
	}


}


UserSchema.methods.leave = function leave(group_name,callback){
	var self = this;
	console.log( self.username+" Call Obj-Method leave group : " + group_name);
	Group.findOne({group_name : group_name},function(err,results){
		if(!err){
			GroupMember.findOneAndRemove({group_id : mongoose.Types.ObjectId(results._id), user_id: self._id},function(err,actionResult){
				if(err){
					console.log("error finding group to leave")
					callback(err,'error_finding_group');
				}else{
					console.log('leaving '+group_name+' success');
					callback('success','leaving_success');
				}
			});
		}else{
			//no group_name = leaving nothing
			 callback(err,'no_group_name');
		}
	});

}

UserSchema.methods.get_groups = function get_groups (callback){
	console.log("get in getgroup");
	var groupList = [];
	GroupMember.find({user_id:this._id},'group_id',function(err,results){
		if(results){
			var myLength = results.length;
			// no group fix
			if (myLength === 0) {
				callback([]);
				return;
			}
			results.forEach(function(item){
				console.log("TRY TO FIND");
				Group.find({_id: mongoose.Types.ObjectId(item.group_id)},'group_name',function(err,groupObj){
					var resolver = {
						group_name: groupObj[0].group_name,
					};
					--myLength;
					groupList.push(resolver);
					if(myLength == 0) callback(groupList);
				});
			});

		}else{
				console.log('no id match in groupmember');
				callback(groupList);
		}
	});

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
			//unhandled , another error which is not handle
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

	User.findOne({username : data.username , password : data.password},{'password' : 0}, function(err, results) {
		if(!results){
			callback(err,'authen_failed');
		}else{
			results.password = undefined;
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
      //username is already created
			next(new Error("duplicated_username"));
		} else {
			//normal case
			next();
		}
	});
});

module.exports = {
	User: User
}
