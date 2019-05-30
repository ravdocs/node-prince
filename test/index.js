/* eslint-env mocha */
'use strict';

var Prince = require('..');
var Utils = require('./utils');

describe('Prince.exec()', function() {

	it('should return data in correct format', function(done) {

		Prince.exec(`${__dirname}/inputs/basic.html`, `${__dirname}/outputs/basic.pdf`, null, null, function(err, stdout, stderr, meta) {
			if (err) return done(err);

			// Utils.log('* stdout:', stdout);
			// Utils.log('* stderr:', stderr);
			Utils.log('* meta:', meta);

			Utils.isBuffer(stdout, 'stdout');
			Utils.isBuffer(stderr, 'stderr');
			Utils.isObject(meta, 'meta');
			Utils.isNumber(meta.duration, 'meta.duration');
			Utils.isNumber(meta.memoryBefore, 'meta.memoryBefore');
			Utils.isNumber(meta.memoryAfter, 'meta.memoryAfter');

			Utils.isEqual(stdout.length, 0, 'stdout.length');
			Utils.isEqual(stderr.length, 0, 'stderr.length');
			Utils.isNotEmpty(meta, 'meta');
			Utils.isGreaterThan(meta.duration, 0, 'meta.duration');
			Utils.isGreaterThan(meta.memoryBefore, 0, 'meta.memoryBefore');
			Utils.isGreaterThan(meta.memoryAfter, 0, 'meta.memoryAfter');

			done();
		});
	});

	it('should return pdf to stdout when output is \'-\'', function(done) {

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
