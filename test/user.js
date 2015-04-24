var should = require('should');
var User = require('../models/user')

describe("Register", function() {
	it("should return success", function(){
		var data = {
			username: "ibosz",
			disp_name: "ibosz_zaza",
			password: "UO(IHCOY()(%$#TXHJVC::IH139345KJLYiee"
		}
		var res = User.register(data);
		res.should.have.property('success', true);
		res.err_msg.should.not.be.ok;
	});
});