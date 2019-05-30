/* eslint-env mocha */
'use strict';

var Prince = require('..');
var Utils = require('./utils');

describe('Prince.version()', function() {

	it('should return version information', function(done) {

		Prince.version(function(err, info) {
			if (err) return done(err);

			// Utils.log('* info:', info);

			Utils.isString(info, 'info');

			Utils.isNotEmpty(info, 'info');

			done();
		});
	});
});
