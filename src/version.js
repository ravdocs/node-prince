'use strict';

var Pkg = require('../package.json');
var Exec = require('./exec');
var version = `${Pkg.name} ${Pkg.version}`;

function appendPrinceVersion(buffer) {
	var mltext = buffer.toString();
	var parts = mltext.split('\n');
	var pv = parts[0].trim();
	var out = version + ` (${pv})`;
	return out;
}

// version once during startup
(function () {
	var input = null;
	var output = null;
	var options = {version: true};
	Exec(input, output, options, function(err, stdout) {
		if (err) throw err;

		version = appendPrinceVersion(stdout);
	});
}());


module.exports = function() {
	return version;
};
