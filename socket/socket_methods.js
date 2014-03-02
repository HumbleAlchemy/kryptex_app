var User = require('../models/user_model');
var Util = require('../lib/hash');

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
			if( user_digest == digest ){
				User.get_current_level_and_wildcard_count( db, user_name, function ( err, user_level_info){
					if( !err ){
						var current_level = user_level_info[0];
						db.lindex( levelSchema.name + current_level , levelSchema.solution_index, function (err, solution){
							if(!err){
								if( solution == user_answer ){
									User.increment_user_score( user_name, function (err, status){
										if(!err){
											db.lindex( levelSchema.name, levelSchema.question_index, function (err, question_url){
												if(!err){
													socket.emit('next_level', question_url, status);
													db.zrevrange( scoreSchema.set_name, 0, 4, function (err, top_five){
														if( !err ){
															socket.broadcast.emit( 'update_leaderboard', top_five);		
														}else{
															console.log( "UNABLE TO FETCH FROM DB AT check_answer INSIDE socket_methods.js");
														}
													});		
												}else{
													console.log('UNABLE TO FETCH FROM DB AT use_wildcard INSIDE socket_methods.js');
												}
											});
										}else{
											console.log('UNABLE TO FETCH FROM DB AT check_answer INSIDE socket_methods.js');
										}
									});
								}else{
									socket.emit("wrong_solution");
								}
							}else{
								console.log('UNABLE TO FETCH FROM DB AT check_answer INSIDE socket_methods.js');
							}
						});
					}
				});
			}else{
				console.log('AUTH ERROR FOR USER '+ user_name);
				socket.emit('auth_error');
			}
		});
		
		/* for updating wildcard information */

		socket.on('use_wildcard',function ( current_level, user_name){
			db.hget( 'user:' + user_name ,userSchema.wildcard_count, function (err, count){
				if( !err){
					if( count > 0 ){
						User.increment_user_score( user_name, function (err, status){
							if(!err){
								db.lindex( levelSchema.name, levelSchema.question_index, function (err, question_url){
									if(!err){
										socket.emit('next_level', question_url, status);
										db.zrevrange( scoreSchema.set_name, 0, 4, function (err, top_five){
											if( !err ){
												socket.broadcast.emit( 'update_leaderboard', top_five);		
											}else{
												console.log( "UNABLE TO FETCH FROM DB AT check_answer INSIDE socket_methods.js");
											}
										});		
									}else{
										console.log('UNABLE TO FETCH FROM DB AT use_wildcard INSIDE socket_methods.js');
									}
								});
							}else{
								console.log('UNABLE TO FETCH FROM DB AT use_wildcard INSIDE socket_methods.js');
							}
						});
					}else{
						socket.emit('wildcard_not_available');
					}
				}
			});
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

