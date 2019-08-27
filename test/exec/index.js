/* eslint-env mocha */

'use strict';

var Assert = require('@ravdocs/assert');
var FS = require('fs');
var Prince = require('../..');
var Fixtures = require('../fixtures');
var dir = __dirname + '/..';

describe('Prince.exec()', function() {
	this.timeout(40000);

	it('should return data in correct format', function(done) {

		var pathIn = (`${dir}/fixtures/basic.html`).replace(/\\/g, '/');
		var pathOut = (`${dir}/outputs/basic.pdf`).replace(/\\/g, '/');
		var options;

		Prince.exec(pathIn, pathOut, options, function(err, pdf, logs, meta) {
			if (err) return done(err);

			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			Assert.isObject('meta', meta);
			Assert.isString('meta.cmd', meta.cmd);
			Assert.isNumber('meta.duration', meta.duration);
			Assert.isGreaterThan('meta.duration', meta.duration, 0);
			Assert.isString('meta.output', meta.output);

			done();
		});
	});

	it('should return pdf to stdout when output is \'-\'', function(done) {
		var input = `${dir}/fixtures/basic.html`;
		var output = '-';
		var options;
		Prince.exec(input, output, options, function(err, pdf, logs, meta) {
			if (err) return done(err);
			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			Assert.isObject('meta', meta);
			done();
		});
	});

	it('should not throw an error with javascript set to false', function(done) {
		var options = {javascript: false};
		Prince.exec(`${dir}/fixtures/basic.html`, '-', options, function(err, pdf, logs) {
			if (err) return done(err);
			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			done();
		});
	});

	it('should return `err` on 1 ms timeout and timeout should be in logs', function(done) {
		var options = {timeout: 1};
		var output = '-';
		var input = Fixtures.toHtml({pages: 50, invalid: false});
		var expected = {type: 'error', source: 'engine/pdf', name: 'error', value: 'PDF rendering timed out after \'1\' milliseconds.'};

		Prince.exec(input, output, options, function(err, pdf, logs, meta) {
			Assert.isError('err', err);
			Assert.strictEqual('err.message', "PDF rendering timed out after '1' milliseconds.", err.message);
			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			Assert.deepStrictEqual('logs[0]', expected, logs[0]);
			Assert.strictEqual('meta.output', "PDF rendering timed out after '1' milliseconds.", meta.output);
			done();
		});
	});

	it('should handle 1000 page pdf', function(done) {
		var options = {};
		var output = '-';
		var input = Fixtures.toHtml({pages: 1000, invalid: false});

		Prince.exec(input, output, options, function(err, pdf, logs, meta) {
			if (err) throw err;
			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			Assert.isObject('meta', meta);
			done();
		});
	});

	it('should humanize `err` to the first error in `logs`', function(done) {
		var options = {};
		var output = '-';
		var input = 'non-existent.html';

		Prince.exec(input, output, options, function(err, pdf, logs, meta) {
			Assert.isError('err', err);
			Assert.strictEqual('err.message', "non-existent.html|can't open input file: No such file or directory", err.message);
			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			Assert.isObject('meta', meta);
			done();
		});
	});

	it('should accept input of type \'Buffer\'', function(done) {

		var pathIn = (`${dir}/fixtures/basic.html`).replace(/\\/g, '/');
		var pathOut = (`${dir}/outputs/basic.pdf`).replace(/\\/g, '/');
		var options;

		FS.readFile(pathIn, function(err, bufferIn) {
			if (err) return done(err);

			Prince.exec(bufferIn, pathOut, options, function(err, pdf, logs, meta) {
				if (err) return done(err);

				Assert.isBuffer('pdf', pdf);
				Assert.isArray('logs', logs);
				Assert.isObject('meta', meta);
				Assert.isString('meta.cmd', meta.cmd);
				Assert.isNumber('meta.duration', meta.duration);
				Assert.isGreaterThan('meta.duration', meta.duration, 0);
				Assert.isString('meta.output', meta.output);

				done();
			});
		});
	});

	it('should accept input of type \'stream.Writable\'', function(done) {

		var pathIn = (`${dir}/fixtures/basic.html`).replace(/\\/g, '/');
		var pathOut = (`${dir}/outputs/basic.pdf`).replace(/\\/g, '/');
		var options;
		var streamIn = FS.createReadStream(pathIn);

		Prince.exec(streamIn, pathOut, options, function(err, pdf, logs, meta) {
			if (err) return done(err);

			Assert.isBuffer('pdf', pdf);
			Assert.isArray('logs', logs);
			Assert.isObject('meta', meta);
			Assert.isString('meta.cmd', meta.cmd);
			Assert.isNumber('meta.duration', meta.duration);
			Assert.isGreaterThan('meta.duration', meta.duration, 0);
			Assert.isString('meta.output', meta.output);

			done();
		});
	});
});
