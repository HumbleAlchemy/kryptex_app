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
	set_name : "user:",
	name : "name",
	password : "password",
	ph_no : "ph_no",
	email : "email",
	current_level : "current_level",
	wildcard_count : "wildcard_count"
};

var scoreSchema = {
	set_name : "scores",
	lower_limit : 0,
	upper_limit : 4
};



 // MOdule for adding user details  
exports.adduser = function(db,user_email,user_password,user_name,user_ph_no,callback) {
	db.exists( userSchema.set_name + user_name,function(err,result){
		if(!err) {
			if(result == 0) {
				db.hmset(userSchema.set_name + user_name,
					userSchema.email,user_email,
					userSchema.password,util.get_hash(user_password),
					userSchema.name,user_name,
					userSchema.ph_no, user_ph_no,
					userSchema.current_level,0,
					userSchema.wildcard_count,2, 
					function(err,data){
						if(!err) {
							db.zadd(scoreSchema.set_name,0,"user:" + user_name,function(err,status){
								if(!err) {
									console.log("successfully registered!");
									callback(null,1);
								} else {
									console.log("ERR in db.zadd in addUser");
								}
							});
						} else {
							console.log("ERR in db.hmset in addUser");
							//callback(err,null);
						}
					});
			}
		} else {
			console.log("ERR in from check_for_id");
		}
	});
}

/* Module for getting user current level */

exports.get_current_level_and_wildcard_count = function( db, user_name, callback){
	db.hmget( userSchema.set_name + user_name, userSchema.current_level, userSchema.wildcard_count,  function ( err, leveldev){
		if( !err ){
			callback( null, leveldev);
		}else{
			console.log("unable to fetch data at get_current_level");
			callback(err,null);
		}
	});
};


/* Module for checking existance of user */

exports.check_for_id = function(db, user_name,callback){
	db.exists( userSchema.set_name + user_name, function (err, status){
		if(!err){
			console.log("status here: " + status);
			callback(null,status);
		} 
		else {
			console.log("unable to fetch data at check_for_id");
			callback(err,null);
		}			
	});
};

/*change user score */



exports.increment_user_score = function(db,user_name,callback) {
	db.zincrby(scoreSchema.set_name,1,"user:" + user_name,function(err,status) {
		if(!err) {
			callback(null,1);
			console.log("from icnrement_user_score" + status);
			db.hset( userSchema.set_name + user_name,userSchema.current_level,status,function(err,status){
				if(!err) {
					callback(null,status);
				} else {
					callback(err,null);
				}
			});
		} else {
			callback(err,null);
		}
	});
}


/* Module for password checking */

exports.check_user = function(db, user_name, user_password, callback){
	db.hmget( userSchema.set_name + user_name, userSchema.name, userSchema.password,function (err, user_detail){
		if(err) {
			console.log("ERR AT FETCHING DATA AT check_user");
			callback(err,null);
		}
			
		else{
			if( user_detail[0] == user_name ){
				if( util.match_hash ( user_password, user_detail[1]) ){
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

exports.use_wildcard = function(db,user_name,callback) {
	db.hmget(userSchema.set_name + user_name,userSchema.wildcard_count,userSchema.current_level,function(err,counts){
		if(!err) {
			// counts[index] => 0 : wildcard_count and 1 : current_level
			var new_wildcard_count = parseInt(counts[0]) - 1; 
			var new_current_level = parseInt(counts[1]) + 1; 
			if(counts[0] > 0) {

				db.hmset(userSchema.set_name + user_name, userSchema.wildcard_count, new_wildcard_count, userSchema.current_level, new_current_level, function(err,status){
					if(!err) {
						console.log("user status: " + status);
						db.zincrby(scoreSchema.set_name,1,"user:" + user_name,function(err,status){
							if(!err) {
								console.log("use_wildcard > zincrby: " + new_wildcard_count);
								callback(null, new_wildcard_count,new_current_level);
							} else {
								console.log("err in use_wildcard > zincrby");		
								callback(err,null,null);
							}	 
						}); //zincrby
					
					} else {
						callback(err,null,null);
					}
				}); // hmset
			} else {
				// no wildcard to use
				callback(null,0,null);
			}	
		} else {
			console.log("ERR in user_model.use wildcard");
			callback(err,null,null);
		}
		
	}); //hmget
}

// gets the number of wildcards left with user
exports.get_wildcard_count = function(db,user_name,callback) {
	db.hget(userSchema.set_name + user_name,userSchema.wildcard_count,function(err,count){
		if(!err) {
			callback(null,count);
		} else {
			console.log("ERR in get_wildcard_count");
			callback(err,null);
		}
	});
}

/*    getting top five users */

module.exports.get_top_users = function (db, callback){
	db.zrevrange( scoreSchema.set_name, scoreSchema.lower_limit, scoreSchema.upper_limit, function (err, top_users){
		if( !err){
			callback( null, top_users);
		}else{
			callback(1, null);
		}
	});
}

module.exports.get_full_rank_list = function(db,callback) {
	db.zrevrangebyscore('scores','+inf','0','withscores',function(err,list){
		if(!err) {
			console.log('get rank list');
			callback(null,list);
		} else {
			callback(err,null);
		}
	});
}
