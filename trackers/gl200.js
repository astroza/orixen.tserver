var gl200 = {};

var hello_regex = /^\+ACK:GTHBD,[0-9a-fA-F]{6},(\d{15}),.*,\d{14},.*\$/;
var report_regex = /^\+....:GT...,[0-9a-fA-F]{6},(\d{15}),.*,(\d*),(\d+.\d),(\d+),(-?\d+\.\d),(-?\d+\.\d+),(-?\d+\.\d+),(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}),.*\$/;
var message_delimiter = /^[^\$]+\$/;

gl200.probe = function(msg)
{
	matches = msg.match(hello_regex);
	if(matches == null)
		return false;
	return matches[1];
}

gl200.digest_message = function(msg)
{
	var matches = msg.match(report_regex);
	if(matches == null)
		return null;

	var report = {}
	report.type = "pos-report";
	report.imei = matches[1];
	report.latitude = parseFloat(matches[7]);
	report.longitude = parseFloat(matches[6]);
	report.velocity = parseFloat(matches[3]);
	report.elevation = parseFloat(matches[5]);
	report.heading = parseFloat(matches[4]);
	report.accuracy = parseFloat(matches[2]);
	report.time = new Date(matches[8], matches[9]-1, matches[10], matches[11], matches[12], matches[13]);

	return report;
}

gl200.pre_parse = function(buffer)
{
	var matches = buffer.match(message_delimiter);
	var pp = {};
	pp.a_message = null;
	pp.remaining_buffer = buffer;
	if(matches != null) {
		pp.a_message = matches[0];
		pp.remaining_buffer = buffer.slice(matches[0].length);
	}
	return pp;
}

gl200.name = "GL200";

module.exports = gl200;
