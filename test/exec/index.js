/* eslint-env mocha */
'use strict';
var Assert = require('@ravdocs/assert');
var Prince = require('../..');
// var Utils = require('./utils');
var dir = __dirname + '/..';

describe('Prince.exec()', function() {

	it('should return data in correct format', function(done) {

		var isWindows = (process.platform === 'win32');
		var stdoutExpected = Buffer.from('');
		var stderrExpected = Buffer.from('');

		Prince.exec(`${dir}/fixtures/basic.html`, `${dir}/outputs/basic.pdf`, null, null, function(err, stdout, stderr, meta) {
			if (err) return done(err);

			// Utils.log('* stdout:', stdout.toString());
			// Utils.log('* stderr:', stderr.toString());
			// Utils.log('* meta:', meta);

			Assert.deepStrictEqual('stdout', stdout, stdoutExpected);
			Assert.deepStrictEqual('stderr', stderr, stderrExpected);

			Assert.isObject('meta', meta);
			Assert.isString('meta.cmd', meta.cmd);
			Assert.isNumber('meta.duration', meta.duration);
			Assert.isNumber('meta.memoryFreeBefore', meta.memoryFreeBefore);
			Assert.isNumber('meta.memoryFreeAfter', meta.memoryFreeAfter);

			Assert.isNotEmpty('meta', meta);
			Assert.strictEqual('meta.cmd', meta.cmd, `prince ${dir}/fixtures/basic.html --output ${dir}/outputs/basic.pdf`);
			Assert.isGreaterThan('meta.duration', meta.duration, 0);
			if (!isWindows) Assert.isGreaterThan('meta.memoryFreeBefore', meta.memoryFreeBefore, 0);
			if (!isWindows) Assert.isGreaterThan('meta.memoryFreeAfter', meta.memoryFreeAfter, 0);

			done();
		});
	});

	it('should return pdf to stdout when output is \'-\'', function(done) {
		Prince.exec(`${dir}/fixtures/basic.html`, '-', null, null, function(err, stdout) {
			if (err) return done(err);
			Assert.isBuffer('stdout', stdout);
			done();
		});
	});

	it('should not throw an error with javascript set to false', function(done) {
		var execOptions = {};
		var princeOptions = {javascript: false};
		Prince.exec(`${dir}/fixtures/basic.html`, '-', princeOptions, execOptions, function(err, stdout) {
			if (err) return done(err);
			Assert.isBuffer('stdout', stdout);
			done();
		});
	});
});
