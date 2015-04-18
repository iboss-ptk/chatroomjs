var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	disp_name : String ,
	password : String
});

//Register Function
UserSchema.statics.register = function(data,returnObject){
	user = new User({ username: data.username, disp_name: data.disp_name ,password: data.password});
	//Save After UserSchema.pre (please see UserSchema.pre)
	user.save(function (err, user) {
			if (err){
					returnObject.success = false,
					returnObject.err_msg = err
					console.error(err);
			}else{
					console.log("New User %s is CREATED", user.username);
					returnObject.success = true;
			}
	});
}

//Login Function
UserSchema.statics.login = function(data,returnObject){
	console.log("USER LOGIN SCHEMA LOGIN!");
	User.findOne({username : data.username},'username', function(err, results) {
			if(!results){
				returnObject.success = false;
				returnObject.err_msg = err;
				console.log("USERNOTFOUND");
			}else{
				returnObject.success = true;
				console.log("FOUND");
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
						next(new Error("User Already Exists :" + results.username));
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
