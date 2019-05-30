/* eslint-env mocha */
'use strict';

var Prince = require('..');
var Utils = require('./utils');

describe('Prince.exec()', function() {

	it('should return data in correct format', function(done) {

		Prince.exec(`${__dirname}/inputs/basic.html`, `${__dirname}/outputs/basic.pdf`, null, null, function(err, stdout, stderr, meta) {
			if (err) return done(err);

			// Utils.log('* stdout:', stdout.toString());
			// Utils.log('* stderr:', stderr.toString());
			// Utils.log('* meta:', meta);

			Utils.isBuffer(stdout, 'stdout');
			Utils.isBuffer(stderr, 'stderr');
			Utils.isObject(meta, 'meta');
			Utils.isNumber(meta.duration, 'meta.duration');
			Utils.isNumber(meta.memoryBefore, 'meta.memoryBefore');
			Utils.isNumber(meta.memoryAfter, 'meta.memoryAfter');

			Utils.is(stdout.length, 0, 'stdout.length');
			Utils.is(stderr.length, 0, 'stderr.length');
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

			// Utils.log('* stdout:', stdout.toString());

			Utils.isBuffer(stdout, 'stdout');

			Utils.is(stdout.length, 30544, 'stdout.length');

			done();
		});
	});
});
