
module.exports.checkUser = function(username,password,callback) {

	if(username == 'abhi' || username == 'kuku') {
		return callback(null,1);
	} else {
		return callback("Invalid username password combi",null);
	}
	
}
