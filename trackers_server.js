var net = require('net');
var server_port = 1140;
var debug = true;
var db = require('./trackers_db');
var config = require('./config');
var tracker_modules = [];
var devices = {};

require("fs").readdirSync("./trackers").forEach(function(module_js) {
	var module = require("./trackers/" + module_js);
	tracker_modules.push(module);
	if(debug)
		console.log("Tracker support for " + module.name + " loaded");
});

function detect_tracker_type(client, data)
{
	for(i = 0; i < tracker_modules.length; i++) {
		imei = tracker_modules[i].probe(data.toString());
		if(imei != false) {
			client.tracker_module = tracker_modules[i];
			client.imei = imei;
			if(debug) {
				console.log("\tTracker type detected: " + client.tracker_module.name);
				console.log("\tTracker IMEI: " + client.imei);
			}
			return true;
		}
	}
	return false;
}

function send_pending_messages(client)
{
	do {
		var msg = db.pop_pending_message(client.imei);
		if(msg == null)
			break;			
		client.write(msg);
		db.save_received_message({type: 1, content: msg});
	} while(1);
}

function digest_data(client, data)
{
	var find_next_msg = true;
	var incoming_data = data;
	do {
		var pp = client.tracker_module.pre_parse(client.remaining_buffer + incoming_data.toString());
		if(pp.a_message) {
			var dm = client.tracker_module.digest_message(pp.a_message);
			if(dm != null) {
				if(dm.type == "pos-report")
					db.save_trackpoint(client.imei, dm);
			} else
				db.save_received_message({type: 0, content: msg});
		} else
			find_next_msg = false;
		client.remaining_buffer = pp.remaining_buffer.replace(/(\r\n|\n|\r)/gm, ""); // replace for testing purposes
		incoming_data = "";
	} while(find_next_msg);
}

var server = net.createServer(function(c) {
	if(debug)
		console.log('+ New tracker');
		
	c.remaining_buffer = "";
	c.tracker_module = null;
	c.replaced = false;
	c.setTimeout(config.inactivity_timeout, function() {
		if(debug)
			console.log('Tracker IMEI=' + c.imei + ' is inactive for too long time');
		c.end();
	});

	c.on('end', function() {
		if(debug)
			console.log('Tracker IMEI=' + c.imei + 'disconnected');
		if(!c.replaced) {
			delete devices[c.imei];
			db.update_status(c.imei, "disconnected");
		}
	});
	
	c.on('data', function(data) {
		if(c.tracker_module == null) {
			if(detect_tracker_type(c, data)) {
				if(db.is_registered(c.imei)) {
					if(devices[c.imei] != undefined) {
						devices[c.imei].replaced = true;
						devices[c.imei].end();
					}
					devices[c.imei] = c;
					db.update_status(c.imei, "connected");
					digest_data(c, data);
				} else {
					if(debug)
						console.log('Tracker IMEI=' + c.imei + 'is not registered.');
					c.end();
				}
			} else
				c.end();
		} else
			digest_data(c, data);
	});
});

server.listen(server_port, function() {
	console.log('Trackers server initialized');
});
