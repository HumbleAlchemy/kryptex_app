var db = require("redis").createClient();
var UserModel = require('../models/user_model');

UserModel.check_for_id(db,"abhishek",function(err,status){
	if(!err) {
		console.log(status);
	}
});

db.hmget("user:abhishek_nair","wildcard_count","current_level",function(err,count){
	console.log(count[1]);
});

UserModel.use_wildcard(db,"abhishek_nair",function(err,status){
	if(!err) {
		console.log(status);
	} else {

	}
});