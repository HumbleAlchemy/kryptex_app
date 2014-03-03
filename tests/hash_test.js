var crypto = require('crypto');

var default_workfactor = 10000;

function get_hash_salt(password,salt) {
	var sha2 = crypto.createHash('sha256');
	//var salt = gen_salt();
	hash = sha2.update(password).digest('hex');
	for (var i = 0; i < default_workfactor; i++) {
		sha2 = crypto.createHash('sha256');
		hash = sha2.update(hash + salt).digest('hex');	
	}
	
	//console.log("hash: " + hash );
	return hash+ ":" + salt;
} 

function get_hash(password) {
	var salt = gen_salt();
	return get_hash_salt(password,salt);
}

module.exports.get_hash = get_hash;

function match_hash(password,hash) {
	var slices = hash.split(':');
	console.log(slices);
	input_hash = get_hash_salt(password,slices[1]);
	console.log("input_hash" + input_hash);
	return input_hash == hash;
}

module.exports.match_hash = match_hash;

function gen_salt() {
	var md5 = crypto.createHash('md5');
	var salt = md5.update(Math.random().toString(36).slice(2)).digest('hex');
	return salt;
}

var hash = get_hash('password');
console.log(hash);
console.log(match_hash('password',hash))