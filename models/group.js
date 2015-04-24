var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
	group_name: {type : String ,
        index: true}
});

GroupSchema.statics.create = function(data,callback){
	group = new Group({group_name: data.group_name});
	group.save(function(err,_group){
		if(err){
			callback(err,'failed');
		}else{
			callback(err,'success');
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
    Group.findOne({group_name : this.group_name},'group_name', function(err, results) {
        if(err) {
            next(err);
        } else if(results) {
            //IF ROOM IS ALREADY CREATED
						next(new Error("already_exist"));
        } else {
						//DIDNT FIND ANYTHING GO AHEAD AND ADD NEW ROOM
            next();
        }
    });
});

module.exports = {
	Group: Group
}
