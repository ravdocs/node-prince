'use strict';

var Pkg = require('../package.json');
var Exec = require('./exec');
var version;

function toVersion(buffer) {
	var mltext = buffer.toString();
	var parts = mltext.split('\n');
	var pv = parts[0].trim();
	var out = `${Pkg.name} ${Pkg.version} (${pv})`;
	return out;
}

module.exports = function(next) {
	var input, output;
	var options = {version: true};

	// return early
	if (version) return process.nextTick(next, null, version);

	Exec(input, output, options, function(err, stdout) {
		if (err) return next(err);

		version = toVersion(stdout);
		next(null, version);
	});
};
