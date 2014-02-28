/*
	user_email

	user_password
	
	user_name
	
	user_ph_no

*/

/*  keys for redis hashset */

var userSchema = {
	name : "name",
	password : "password",
	ph_no : "ph_no",
	email : "email",
	current_level : "current_level",
	wildcard_count : "wildcard_count"
};


/* MOdule for adding user details */

exports.adduser = function(db, user_email, user_password,user_name, user_ph_no){
	if( check_for_user(db, user_name) == 0){
		db.hset("user:"+user_name,
			userSchema.email, user_email, 
			userSchema.password, user_password,
		  	userSchema.name, user_name,
		   	userSchema.ph_no, user_ph_no,
		    userSchema.current_level, 0,
		    userSchema.wildcard_count, 2,
			function (err, status){
				if(err) console.log("ËRR IN FETCHING DB AT adduser");
			}
		);	
	}
};

/* MOdule for checking existance of user */

exports.check_for_id = function(db, user_name){
	db.exists("user:"+ user_name, function (err, status){
		if(err) console.log("unable to fetch data at check_for_id");
		return status;
	});
};



