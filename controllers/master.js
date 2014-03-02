
// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };
var User = require('../models/user_model');
var Level = require('../models/level_model');
var util = require('../lib/hash');
module.exports = function(app,db) {

	/*     GET ROUTES      */

	app.get('/',function(req,res){
		res.render('first');
	});

	//app.get('')
	app.get('/login', function  ( req, res) {
		if (!req.param('title')){
			res.render('login', { title : 'login', user_name : ""});
		}else if(!req.param('user_name')){
			res.render('login', { title : req.param('title')});	
		}else{
			res.render('login', { title : req.param('title'), user_name : req.param('user_name')});
		}
		
	});

	app.get('/problem_window' ,isLoggedIn , function ( req, res) {
		var user_name = req.session.userId;
		var digest = util.get_hash( user_name);
		User.get_current_level_and_wildcard_count( db, user_name, function ( err, current_level_wildcard_count){
			if( !err ){
				Level.get_level_image( current_level_wildcard_count[0], db, function (problem_image){
					if( !problem_image ){
						console.log("can't get image in problem_window for " +  user_name);
						res.redirect('/');
					}else{
						res.render('problem_window', { user_name : user_name,
							digest : digest, 
							current_level : current_level_wildcard_count[0],
						 	wildcard_count : current_level_wildcard_count[1],
						 	image :  problem_image
						});
					}	
				});
			}else{
				res.redirect('/');
			}
		});
	});

	app.get('/rules_info', function (req, res){
		res.render('rules',{ user_name : req.session.userId, message : "You have been successfully registered" });
	});
	


	/*==============================================================================================================*/

	/*    POST ROUTES       */

	app.post('/signin',function(req,res) {
		console.log('username: ' + req.param('user_name') + 'password: ' + req.param('user_password'));
		User.check_user(db,	req.param('user_name'), req.param('user_password'),function(err,data) {
			if( data == 0) {
				//user has logged in, saved to session
				req.session.isLoggedIn = true;
				req.session.userId = req.param('user_name');
				console.log('user ok! ' + req.session.isLoggedIn );
				res.redirect('/problem_window');
			}else if( data == 1){
				console.log('user wrong!');
				res.redirect('/login?title="Wrong Username"');
			}else{
				console.log('password wrong!');
				res.redirect( '/login?title="Wrong Password"&user_name=' + req.param('user_name'));
			}
		});
	});

	app.post('/signup',function (req, res){
		console.log("");
		User.adduser(db, req.param('user_email'),req.param("user_password"),req.param("user_name"),req.param("user_ph_no"),function (err, status){
			if(!err){
				res.redirect("/rules_info");
			}else{
				res.redirect('/');
			}
		});
	});


	/*==============================================================================================================*/

	/*    ADMIN ROUTES (POST,GET)     */

	app.get('/admin',function(req,res){
			res.render("admin");
	});

	app.get('/admin/dashboard',function(req,res) {
		res.render('admin_dashboard');
	});

	app.post('/admin/signin',function(req,res){
		User.check_user(db,	req.body.username,req.body.password,function(err,data) {
			if(!err) {
				res.redirect('/admin/dashboard');
			} else {
				consol.log("ERR in msater.js /admin/signin");
			}
		});
	});

	app.post('/admin/dashboard/addlevel',function(req,res){
		console.log(req.param('levelImage'));

		var fs = require('fs');
		 // get the temporary location of the file
	    var tmp_path = req.files.levelImage.path;
	    // set where the file should actually exists - in this case it is in the "images" directory
	    var target_path = '../files/levels/' + req.files.levelImage.name;
	    // move the file from the temporary location to the intended location
	    fs.rename(tmp_path, target_path, function(err) {
	        if (err) throw err;
	        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
	        fs.unlink(tmp_path, function() {
	            if (err) throw err;
	            res.send('File uploaded to: ' + target_path + ' - ' + req.files.levelImage.size + ' bytes');
	        });
	    });
		//res.send(req.files);
	});

	



}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.session.isLoggedIn == true)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function isRestricted(req,res,next) {
	res.send("404 BitchAss!");
}