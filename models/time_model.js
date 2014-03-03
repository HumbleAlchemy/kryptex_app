var timeSchema = {
	start_time : "kryptex:start_time",
	end_time : "kryptex:end_time"
}

exports.set_time = function(db,start_time_ms,days,callback) {
	db.set(timeSchema.start_time,start_time_ms,function(err,status){
		if(!err) {
			var end_time_ms = parseInt(start_time_ms) + days*24*60*60*1000; //converting days to milliseconds
			db.set(timeSchema.end_time,end_time_ms,function(err,status){
				if(!err) {
					console.log("SUCCESSfully set end_time time_model.set_time");
					callback(null,status);
				} else {
					console.log("ERR in time_model.set_time");
					callback(err,null);
				}
			}); 
		} else {
			console.log("ERR in time_model.set_time");
			callback(err,null);
		}
	});
}


exports.get_time = function(db, callback){
	db.get(timeSchema.end_time, function (err, end_time){
		if( !err ){
			callback (null, end_time);
		}else{
			console.log('ERR AT get_time inside time_model');
			callback( 1, null);
		}
	});
}