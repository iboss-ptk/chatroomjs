var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
	name:{type : String , unique: true,
        index: true}
});

var Group = mongoose.model('Group', GroupSchema);

GroupSchema.pre("save", function(next) {
    var self = this;
    Group.findOne({name : this.name}, 'name', function(err, results) {
        if(err) {
            next(err);
        } else if(results) {
            //IF ROOM IS ALREADY CREATED

						next(new Error("Group Already Exists : Joining Group " + results.name));
        } else {
						//DIDNT FIND ANYTHING GO AHEAD AND ADD NEW ROOM
            next();
        }
    });
});

module.exports = {
	Group: Group
}
