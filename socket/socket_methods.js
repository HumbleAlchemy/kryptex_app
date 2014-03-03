var User = require('../models/user_model');
var Util = require('../lib/hash');
var Level = require('../models/level_model');

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

var levelSchema = {
	name : "level:",
	question_index : 0,
	solution_index : 1
};

module.exports = function (io, db) {
	io.sockets.on("connection", function (socket){

		/* for checking user solution */
		
		socket.on('check_answer', function ( user_name, digest, user_answer){
			var user_digest = Util.get_hash( user_name );
			if( user_digest == digest ) {
				User.get_current_level_and_wildcard_count( db, user_name,function (err,data){
					var current_level = data[0];
					console.log( " user_answer : " + user_answer + " >>>>>>> " + current_level );
					Level.check_level_solution(db, user_answer,current_level,function(err,status){
						if(status == true) {
							User.increment_user_score(db,user_name,function(err,data){
								if(!err) {
									//show new level image
									Level.get_level_image(db,parseInt(current_level) + 1,function (err, image_url) {
										if(!err) {
											socket.emit('next_level', image_url, status);
											User.get_top_users( db, function (err, top_users){
												if( !err ){
													console.log('alpha centuria' );
													io.sockets.emit('update_leaderboard', top_users);
												}else{
													console.log('err at check_answer inside update_leaderboard');
												}
											});
										} else {
											console.log(err);
										}
									});
								} else {
									console.log(err);
								}
							});

							
						} else {
							socket.emit('wrong_solution');
						}
					});
				});
			} else {

			}
			
		});
		
		/* for updating wildcard information */

		socket.on('use_wildcard',function ( current_level,digest, user_name){
			var user_digest = Util.get_hash( user_name );
			if( user_digest == digest ){
				User.use_wildcard(db,user_name,function(err,wildcard_count,new_level){
					if(!err) {
						console.log( "teah " + new_level);
						Level.get_level_image(db,new_level,function (err, image_url) {
							if(!err) {
								socket.emit('next_level', image_url, status);
								User.get_top_users( db, function (err, top_users){
									if( !err ){
										socket.broadcast.emit('update_leaderboard', top_users);
									}else{
										console.log('err at check_answer inside update_leaderboard');
									}
								});
							} else {
								console.log(err);
							}
						});	
					} else {
						console.log(err);
					}
				});
			}else{
				console.log('AUTH ERROR FOR USER '+ user_name);
				socket.emit('auth_error');
			}
		});

		/* for checking existance of user name*/

		socket.on('check_for_user_name',function (user_name){
			User.check_for_id(db, user_name,function(err,status){
				console.log("from socket: " + status);
				if( status == 1 ){
					socket.emit( 'invalid_user_name');
				}
			});
		});

		/*================ from admin panel ===============*/

		socket.on('set_time',function(start_time_ms){
			
		});



	});
}

