var crypto = require('crypto');
module.exports.get_hash = function(password) {
	var sha2 = crypto.createHash('sha256');
	var hash = sha2.update(password).digest('hex');
	console.log("hash: " + hash );
	return hash;
} 

module.exports.match_hash = function(password,hash) {
	var sha2 = crypto.createHash('sha256');
	var input_hash = sha2.update(password).digest('hex');
	return input_hash == hash;
}