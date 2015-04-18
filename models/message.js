var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true
	}
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = {
	Message: Message
}
