var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true
	}
});

var Group = mongoose.model('Group', GroupSchema);

module.exports = {
	Group: Group
}