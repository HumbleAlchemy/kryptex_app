
var LevelSchema = {
	schema_name : "level",
	image_index : 0,
	solution : 1
}


module.exports.add_level = function() {

}

module.exports.get_level_image = function(db,level_no,callback) {
	key = LevelSchema.schema_name + ':' + level_no;
	console.log(key);
	db.lindex( key, LevelSchema.image_index, function(err,data) {
		if(!err) {
			console.log( data);
			callback (null,data);
		} else {
			console.log("ERROR: level_model.js , get_level module");
			callback(err,null);
		}
	});
}

module.exports.check_level_solution = function(db,user_solution,level_no,callback) {
	key = LevelSchema.schema_name + ':' + level_no;
	console.log( "fck +" +key);
	db.lindex( key, LevelSchema.solution, function(err,data) {
		console.log("user_solution: " + user_solution + " sol: " + data );
		if(!err) {

			if (data.toLowerCase() === user_solution.toLowerCase()){
				callback (null, true);
			}else{
				callback (null, false);
			}
			
			
		} else {
			console.log("ERROR: level_model.js , get_level module");
			callback(err,null);
		}
	});
}