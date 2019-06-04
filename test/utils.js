/* eslint-env mocha */
'use strict';

require('colors');
// var Prove = require('provejs-params');

exports.log = function(arg1, arg2) {

	// Prove('**', arguments);

	var indent = ' ';

	if (typeof arg1 === 'string' && arg1[0] === '*') {

		if (typeof arg2 !== 'string') arg2 = JSON.stringify(arg2);

		if (arg1) arg1 = indent + arg1.gray;
		if (arg2) arg2 = indent + arg2.gray;
	}

	if (arguments.length === 2) {
		console.log(arg1, arg2);
	} else {
		console.log(arg1);
	}
};
