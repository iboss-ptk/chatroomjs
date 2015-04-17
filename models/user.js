var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true
	},
	disp_name : String ,
	password : String
});

var User = mongoose.model('User', UserSchema);

UserSchema.pre("save", function(next) {
    //var self = this;
    User.findOne({name : this.name}, 'name', function(err, results) {
        if(err) {
					 //Another Error
            next(err);
        } else if(results) {
            //IF USER IS ALREADY CREATED
						next(new Error("User Already Exists : Logged in as " + results.name));
        } else {
						//DIDNT FIND ANYTHING GO AHEAD AND ADD NEW ROOM
            next();
        }
    });
});

module.exports = {
	User: User
}
