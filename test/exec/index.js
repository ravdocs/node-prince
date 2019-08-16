/* eslint-env mocha */

'use strict';

var Assert = require('@ravdocs/assert');
var Prince = require('../..');
// var Utils = require('./utils');
var dir = __dirname + '/..';

describe('Prince.exec()', function() {

	it('should return data in correct format', function(done) {

		var stdoutExpected = Buffer.from('');
		var stderrExpected = Buffer.from('');
		var pathIn = (`${dir}/fixtures/basic.html`).replace(/\\/g, '/');
		var pathOut = (`${dir}/outputs/basic.pdf`).replace(/\\/g, '/');

		Prince.exec(pathIn, pathOut, null, null, function(err, stdout, stderr, meta) {
			if (err) return done(err);

			Assert.deepStrictEqual('stdout', stdout, stdoutExpected);
			Assert.deepStrictEqual('stderr', stderr, stderrExpected);

			Assert.isObject('meta', meta);
			Assert.isString('meta.cmd', meta.cmd);
			Assert.isNumber('meta.duration', meta.duration);
			Assert.isObject('meta.memory', meta.memory);
			Assert.isObject('meta.memory.before', meta.memory.before);
			Assert.isObject('meta.memory.after', meta.memory.after);

			// on linux we care more about "available" memory than "free" memory
			// https://www.linuxatemyram.com/
			Assert.isNumber('meta.memory.before.available', meta.memory.before.available);
			Assert.isNumber('meta.memory.after.available', meta.memory.after.available);

			var cmd = (`prince '${pathIn}' --output '${pathOut}'`);

			Assert.strictEqual('meta.cmd', meta.cmd, cmd);
			Assert.isGreaterThan('meta.duration', meta.duration, 0);

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
