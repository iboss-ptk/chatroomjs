var mongoose = require("mongoose");

var GroupMemberSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true
	}
});

var GroupMember = mongoose.model('GroupMember', GroupMemberSchema);

module.exports = {
	GroupMember: User
}