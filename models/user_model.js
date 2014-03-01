/*
	user_email
	user_password
	user_name	
	user_ph_no
*/

/*  keys for redis hashset */
var crypto = require('crypto');
var util = require('../lib/hash');

var userSchema = {
	name : "name",
	password : "password",
	ph_no : "ph_no",
	email : "email",
	current_level : "current_level",
	wildcard_count : "wildcard_count"
};

var scoreSchema = {
	set_name : "scores"
};


/* MOdule for adding user details */
exports.adduser = function(db, user_email, user_password,user_name, user_ph_no,callback){
	check_for_id(db, user_name,function (err, status){
		if( !err) {
			if( status == 0 ){
				db.hmset("user:"+user_name,
					userSchema.email, user_email, 
					userSchema.password, util.get_hash(user_password),
					userSchema.name, user_name,
					userSchema.ph_no, user_ph_no,
					userSchema.current_level, 0,
					userSchema.wildcard_count, 2,
					function (err, status){
						if(err){
							console.log("ERR IN FETCHING DB AT adduser");
							callback(err,null);
						}else{
							db.zadd( scoreSchema.set_name, 0, user_name, function (err, status){
								if(err){
									console.log("ERR IN FETCHING DB AT adduser");
									callback(err,null);
								}else{
									callback(null,1);
								}
							});
						}
				});
			}else{

			}
		}
	});		
};

/* Module for checking existance of user */
var  check_for_id = function (db, user_name,callback){
	db.exists("user:"+ user_name, function (err, status){
		if(err) 
			console.log("unable to fetch data at check_for_id");
		else
			callback(null,status);
	});
};

exports.check_for_id = check_for_id;
/*change user score */
exports.increment_user_score = function(user_name,callback) {
	db.zincrby(scoreSchema.set_name,1,user_name,function(err,status) {
		if(!err) {
			callback(null,1);
		} else {
			db.hset("user:" + user_name,userSchema.current_level,status,function(err,status){
				if(!err) {
					callback(null,status);
				} else {
					callback(err,null);
				}
			});
			callback(err,null);
		}
	});
}


/* Module for password checking */

exports.check_user = function(db, user_name, user_password, callback){
	db.hmget("user:"+user_name, userSchema.name, userSchema.password,function (err, user_detail){
		if(err) {
			console.log("ERR AT FETCHING DATA AT check_user");
			callback(err,null);
		}
			
		else{
			if( user_detail[0] == user_name ){
				if(util.check_hash(user_password,user_detail[1])){
					callback(null,0);
				}else{
					callback(null,2);
				}	
			}else{
				callback(null,1);
			}
		}
	});
};




