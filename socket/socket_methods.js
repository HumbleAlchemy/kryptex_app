var User = require('../models/user_model');
var Util = require('../lib/hash');
var Level = require('../models/level_model');
var Time = require('../models/time_model');

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
			//var user_digest = Util.get_hash( user_name );
			if( Util.match_hash(user_name,digest) ) {
				User.get_current_level_and_wildcard_count( db, user_name,function (err,data){
					var current_level = data[0];
					console.log( " user_answer : " + user_answer + " >>>>>>> " + current_level );
					Level.check_level_solution(db, user_answer,current_level,function(err,status){
						if(status == true) {
							User.increment_user_score(db,user_name,current_level,function(err,data){
								if(!err) {
									//show new level image
									var incr_level = parseInt(current_level) + 1;
									Level.get_level_image(db, incr_level, function (err, image_url) {
										if(!err) {
											Level.get_total_questions_count( db, function ( err, value){
												console.log('value inside cehck_ans '+value);
												if( value > incr_level){
													socket.emit('next_level', image_url, parseInt(current_level) + 1, data[1], status);
													User.get_top_users( db, function (err, top_users){
														if( !err ){
															console.log('alpha centuria' );
															io.sockets.emit('update_leaderboard', top_users);
														}else{
															console.log('err at check_answer inside update_leaderboard');
														}
													});
												}else{
													socket.emit('quiz_completed');
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

		socket.on('use_wildcard',function (  user_name, digest){
			if( Util.match_hash(user_name,digest) ){
				User.use_wildcard(db,user_name,function (err, wildcard_count, new_level){
					if(!err) {
						if( wildcard_count >= 0){
							console.log( "teah " + new_level);
							Level.get_level_image(db,new_level,function (err, image_url) {
								if(!err) {
									socket.emit('next_level', image_url, new_level, wildcard_count);
									User.get_top_users( db, function (err, top_users){
										if( !err ){
											io.sockets.emit('update_leaderboard', top_users);
										}else{
											console.log('err at check_answer inside update_leaderboard');
										}
									});
								} else {
									console.log(err);
								}
							});
						} else{
							socket.emit('no_wildcard_remain');
						}
						
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

		socket.on('set_time',function(){
			start_time_ms = (new Date()).getTime().toString();
			Time.set_time(db,start_time_ms,function(){
				if(!err) {

				} else {
					
				}
			});

		});

		/* end all live socket */

		socket.on('end_all_sockets', function (){
			
			io.server.close(); // to stop receiving new connections

			socket.broadcast.emit('close_connection');

		});

	});
}

