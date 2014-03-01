
var LevelSchema = {
	schema_name : "level",
	image_path : 0,
	solution : 1
}


modeule.exports.add_level = function() {

}

module.exports.get_level_image = function(level_no,db) {
	key = LevelSchema.schema_name + ':' + level_no;
	level_details = db.lrange(key,function(err,data) {
		if(!err) {
			return level_details[LevelSchema.image_path];
		} else {
			console.log("ERROR: level_model.js , get_level module");
			return null;
		}
	});
}

