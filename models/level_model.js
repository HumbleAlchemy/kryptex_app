
var LevelSchema = {
	schema_name : "level",
	image_index : 0,
	solution : 1
}


module.exports.add_level = function() {

}

module.exports.get_level_image = function(level_no,db,callback) {
	key = LevelSchema.schema_name + ':' + level_no;
	console.log(key);
	db.lindex( key, LevelSchema.image_index, function(err,data) {
		if(!err) {
			callback (data);
		} else {
			console.log("ERROR: level_model.js , get_level module");
			callback(null);
		}
	});
}

