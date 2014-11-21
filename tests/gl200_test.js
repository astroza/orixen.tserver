gl200 = require("../devices/gl200");
console.log(gl200.pre_parse("+ACK:GTHBD,02010B,867844001423980,,20140903034616,6F75$+RESP:GTFRI,02010B,867844001423980,,0,0,1,0,0.0,0,222.4,-71.244013,-34.988330,20140902235854,0730,0002,927D,89DC,,35,20140903034441,6F45$"));

console.log(gl200.pre_parse("asdf"));
console.log(gl200.pre_parse("asdf$abf"));
