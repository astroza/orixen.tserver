var syrus = {};

var hello_regex = ;
var report_regex = /^>REV(\d{2})(\d{4})(\d)(\d{5})([\+|\-]\d{7})([\+|\-]\d{8})(\d{3})(\d{3})(\d)(\d)(\S*)</;
var message_delimiter = ;

syrus.probe = function(msg)
{
	return hello_regex.test(msg);
}

syrus.digest_message = function(msg)
{
	var matches = msg.match(report_regex);
	if(matches == null && matches.length >= 12)
		return null;

	var report = {}
	report.type = "pos-report";
	report.event_idx = matches[1]
	var weeks = matches[2].to_i
	var day = matches[3].to_i
	var time = matches[4].to_f
	report.latitude = Float(matches[5])/100000.0;
	report.longitude = Float(matches[6])/100000.0;
	report.velocity = Float(matches[7])*1.609344;
	report.heading = matches[8]
	report.elevation = 0;
	report.accuracy = -1;
	
	/*
	fix_mode = matches[9]
	age = matches[10]
	extended = matches[11]
	*/
	datetime = DateTime.new(1980, 1, 6, 0, 0, 0, "00:00")
	datetime += 7*weeks
	datetime += day
	datetime += time/(24*3600)
	return report;
}

syrus.pre_parse = function(buffer)
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

syrus.name = "SYRUS";

module.exports = syrus;
