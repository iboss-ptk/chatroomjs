var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	_id: String
	// password: String,
	// disp_name: String,
	// pic_path: String,
	// group_id: String
});

var User = mongoose.model('User', UserSchema);

// instaces method
// UserSchema.methods.authenticate = function (callback) {

// }

// UserSchema.statics.authenticate = function (callback) {
// 	return 
// }

module.exports = {
	User: User
}