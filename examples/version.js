'use strict';

var Prince = require('..');

var options = {
	version: true
};

Prince.exec(null, null, options, null, function(err, stdout/*, stderr*/) {
	if (err) throw err;

	stdout = stdout.toString();

	console.log(stdout);
});
