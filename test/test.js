'use strict';

var Prince = require('..');

Prince.exec('./test/test.html', './test/test.pdf', null, null, function(err, stdout) {
	if (err) throw err;

	if (stdout) console.log('stdout:', stdout.toString());

	console.log('OK: done');
});
