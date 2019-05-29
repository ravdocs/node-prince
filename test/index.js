/* eslint-env mocha */
'use strict';

var Prince = require('..');
var Utils = require('./utils');

describe('Prince.exec()', function() {

	it('should not error', function(done) {

		Prince.exec(`${__dirname}/inputs/basic.html`, `${__dirname}/outputs/basic.pdf`, null, null, function(err, stdout, stderr) {
			if (err) return done(err);

			// Utils.log('* stdout:', stdout);
			// Utils.log('* stderr:', stderr);

			Utils.isBuffer(stderr, 'stderr');
			Utils.isEqual(stderr.length, 0, 'stderr.length');

			done();
		});
	});

	it('should return a buffer when output is \'-\'', function(done) {

		Prince.exec(`${__dirname}/inputs/basic.html`, '-', null, null, function(err, stdout) {
			if (err) return done(err);

			// Utils.log('* stdout:', stdout);

			Utils.isBuffer(stdout, 'stdout');
			Utils.isEqual(stdout.length, 30544, 'stdout.length');

			done();
		});
	});
});

describe('Prince.version()', function() {

	it('should not error', function(done) {

		Prince.version(function(err) {
			if (err) return done(err);

			done();
		});
	});

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
