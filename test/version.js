/* eslint-env mocha */
'use strict';

var Assert = require('@ravdocs/assert');
var Prince = require('..');
// var Utils = require('./utils');

describe('Prince.version()', function() {

	it('should return version information', function(done) {

		Prince.version(function(err, info) {
			if (err) return done(err);

			// Utils.log('* info:', info);

			Assert.isString('info', info);

			Assert.isNotEmpty('info', info);

			done();
		});
	});
});
