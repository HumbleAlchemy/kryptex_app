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

		socket.on('check_answer', function ( user_name, digest, current_level, user_answer){
			var user_digest = hash.get_hash( user_name );\
			if( user_digest == digest ){
				db.lindex( levelSchema.name + current_level , levelSchema.solution_index, function (err, solution){
					if(!err){
						if( solution == user_answer ){
							User.increment_user_score( user_name, function (err, status){
								if(!err){
									db.lindex( levelSchema.name, levelSchema.question_index, function (err, question_url){
										if(!err){
											socket.emit('next_level', question_url, current_level+1);
										}else{
											console.log('UNABLE TO FETCH FROM DB AT check_answer INSIDE socket_methods.js');
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
			}else{
				console.log('AUTH ERROR FOR USER '+ user_name);
				socket.emit('auth_error');
			}
		});

		socket.on('use_wildcard',function ( current_level, user_name){
			db.hget( 'user:' + user_name ,userSchema.wildcard_count, function (err, count){
				if( !err){
					if( count > 0 ){
						User.increment_user_score( user_name, function (err, status){
							if(!err){
								db.lindex( levelSchema.name, levelSchema.question_index, function (err, question_url){
									if(!err){
										socket.emit('next_level', question_url, current_level+1);
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
	});
}

