
/*
 * GET home page.
 */

// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };
var User = require('../models/user_model.js');

module.exports = function(app) {
	app.get('/',function(req,res){
		res.render('index' ,{title : 'Express'});
	});

	app.get('/login',function(req,res) {
		res.render('login',{title:'Login'});
	});

	app.post('/signin',function(req,res) {
		console.log('username: ' + req.body.username + 'password: ' + req.body.password);
		User.checkUser(req.body.username,req.body.password,function(err,data) {
			if(!err) {

				//user has logged in, saved to session
				req.session.isLoggedIn = true;
				req.session.userId = req.body.username;
				console.log('user ok! ' + req.session.isLoggedIn );
				res.redirect('/test');
			} else {
				console.log('user wrong!');
				res.redirect('/login');
			}
		})
	})

	app.get('/test',isLoggedIn, function(req,res) {
		res.send('logged in user: ' + req.session.id);
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