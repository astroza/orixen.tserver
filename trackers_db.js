var db = {};


db.is_registered = function(imei) {
	return true;
};

db.update_status = function(imei, value) {
	console.log("updating status to " + value);
};

db.save_trackpoint = function(imei, report) {
	console.log(report);
};

db.pop_pending_message = function(imei) {
	
};

db.save_received_message = function(imei, message) {
	
};

module.exports = db;