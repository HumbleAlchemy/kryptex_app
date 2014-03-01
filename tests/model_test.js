var db = require("redis").createClient();
var UserModel = require('../models/user_model');

UserModel.check_for_id(db,"abhishek",function(err,status){
	if(!err) {
		console.log(status);
	}
});