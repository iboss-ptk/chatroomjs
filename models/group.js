var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
	name:{type : String , unique: true,
        index: true}
});

GroupSchema.statics.create = function(data,returnObject){
	group = new Group({name:data.name});
	group.save(function(err,_group){
		if(err){
			returnObject.success = false,
			returnObject.err_msg = err
			console.error(err);
		}else{
			console.log("New Group %s is CREATED",_group.name);
			returnObject.success = true;
		}
	});
}

GroupSchema.statics.remove = function(data,returnObject){
	//IMPLEMENTATION OF A GROUP REMOVE HERE
	//DATA = GROUP NAME
	//NEED PRE EVENT IMPLEMENTATION TOO
}

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
