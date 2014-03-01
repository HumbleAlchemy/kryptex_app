
// exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };
var User = require('../models/user_model.js');

module.exports = function(app,db) {
	app.get('/',function(req,res){
		res.render('login' ,{title : 'Login'});
	});

	app.post('/signin',function(req,res) {
		console.log('username: ' + req.body.username + 'password: ' + req.body.password);
		User.check_user(db,	req.body.username,req.body.password,function(data) {
			if( data == 0) {
				//user has logged in, saved to session
				req.session.isLoggedIn = true;
				req.session.userId = req.body.username;
				console.log('user ok! ' + req.session.isLoggedIn );
				res.redirect('/test');
			}else if( data == 1){
				console.log('user wrong!');
				res.redirect('/login',{title : "Wrong Username"});
			}else{
				console.log('password wrong!');
				res.redirect('/login',{title : "Wrong Password"});
			}
		})
	})

	app.get('/test' /* ,isLoggedIn */ , function(req,res) {
		//res.send('logged in user: ' + req.session.id);
		res.render('test',{message : 'message for you!'});
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