
// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };
var User = require('../models/user_model.js');

module.exports = function(app,db) {

	/*     GET ROUTES      */
	app.get('/',function(req,res){
		res.render('login' ,{title : 'Login'});
	});

	app.get('/problem_window' ,isLoggedIn , function(req,res) {
		res.render('problem_window', { user_name : req.session.userId});
	});

	app.get('/rules_info', function (req, res){
		res.render('rules',{ user_name : req.session.userId, message : "You have been successfully registered" });
	});
	


	/*==============================================================================================================*/

	/*    POST ROUTES       */

	app.post('/signin',function(req,res) {
		console.log('username: ' + req.body.username + 'password: ' + req.body.password);
		User.check_user(db,	req.body.username,req.body.password,function(data) {
			if( data == 0) {
				//user has logged in, saved to session
				req.session.isLoggedIn = true;
				req.session.userId = req.body.username;
				console.log('user ok! ' + req.session.isLoggedIn );
				res.redirect('/problem_window');
			}else if( data == 1){
				console.log('user wrong!');
				res.redirect('/login',{title : "Wrong Username"});
			}else{
				console.log('password wrong!');
				res.redirect('/login',{title : "Wrong Password"});
			}
		})
	});

	app.post('/signup',function (req, res){
		console.log("");
		User.adduser(db, req.params('user_email'),req.params("user_password"),req.params("user_name"),req.params("user_ph_no"),function (err, status){
			if(!err){
				res.redirect("/rules_info");
			}else{
				res.redirect('/');
			}
		});
	});


	/*==============================================================================================================*/

	/*    ADMIN ROUTES (POST,GET)     */

	


}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.session.isLoggedIn == true)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}