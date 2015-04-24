var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
  content: String,
  username: String,
  group_name: String,
  seq: Number,
  sent_at: Date,
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = {
	Message: Message
}
