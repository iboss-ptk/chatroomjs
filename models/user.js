var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true
	},
	disp_name : String ,
	password : String
});

//Register Function
UserSchema.statics.register = function(data, callback){
	var returnObject = {};
	user = new User({ name: data.username, disp_name: data.disp_name ,password: data.password});
	//Save After UserSchema.pre (please see UserSchema.pre)
	user.save(function (err, user) {
		if (err){
			callback('duplicated_username','error');
		}else{
			callback('okay','success');
		}
	});

}

//Login Function
UserSchema.statics.login = function(data,callback){
	User.findOne({username : data.username},'username', function(err, results) {
		if(!results){
			//err.username_not_found = true;
			callback(err,'username not found');
		}else{
			callback(err,'username found');
		}
	});
}

//After Define Function Then Packed it in modelSchema
var User = mongoose.model('User', UserSchema);

UserSchema.pre("save", function(next) {
	User.findOne({name : this.name},'name', function(err, results) {
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
