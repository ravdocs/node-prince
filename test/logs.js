/* eslint-env mocha */
'use strict';

var OS = require('os');
var Assert = require('@ravdocs/assert');
var Prince = require('..');
// var Utils = require('./utils');

describe('Prince.logs()', function() {

	it('should parse \'sta|...\' lines correctly', function(done) {

		var stderr = Buffer.from('sta|Loading document...');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'status', value: 'Loading document...'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'msg|err|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|err|Test error');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'error', source: 'engine/pdf', name: 'error', value: 'Test error'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'msg|wrn|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|wrn|http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'warn', source: 'engine/pdf', name: 'warning', value: 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'msg|inf|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|inf|loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'info', value: 'loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'msg|dbg|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|dbg|loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'debug', value: 'loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'msg|out|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|out|Some message from console.log');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'output', value: 'Some message from console.log'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'prg|...\' lines correctly', function(done) {

		var stderr = Buffer.from('prg|0');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'progress-percent', value: '0'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'dat|...|...\' lines correctly', function(done) {

		var stderr = Buffer.from('dat|key|val');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'data', source: 'engine/pdf', name: 'key', value: 'val'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'fin|success\' lines correctly', function(done) {

		var stderr = Buffer.from('fin|success');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'document', value: 'success'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse \'fin|failure\' lines correctly', function(done) {

		var stderr = Buffer.from('fin|failure');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'document', value: 'failure'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should handle bug where \'msg|err|...\' is formatted as \'msg|err||...\'', function(done) {

		var stderr = Buffer.from('msg|err||Test error');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'error', source: 'engine/pdf', name: 'error', value: 'Test error'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should handle bug where \'msg|wrn|...\' is formatted as \'msg|wrn||...\'', function(done) {

		var stderr = Buffer.from('msg|wrn||http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'warn', source: 'engine/pdf', name: 'warning', value: 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should handle bug where \'msg|inf|...\' is formatted as \'msg|inf||...\'', function(done) {

		var stderr = Buffer.from('msg|inf||loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'info', value: 'loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should handle bug where \'msg|dbg|...\' is formatted as \'msg|dbg||...\'', function(done) {

		var stderr = Buffer.from('msg|dbg||loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');
		var logs = Prince.logs(stderr);
		var expected = [{type: 'info', source: 'engine/pdf', name: 'debug', value: 'loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat'}];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should parse multiple lines correctly', function(done) {

		var EOL= OS.EOL;
		var stderrLines = [
			// 'msg|inf||loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat',
			// 'sta|Loading document...',
			// 'msg|inf||loading document: http://localhost:8080/file.html',
			// 'msg|inf||loading HTML5 input: http://localhost:8080/file.html',
			// 'msg|inf||loading document: http://localhost:8080/file.html',
			'sta|Running scripts...',
			// 'sta|Applying style sheets...',
			// 'msg|inf||loading style sheet: https://use.fontawesome.com/releases/v5.0.1/css/all.css',
			// 'msg|inf||loading style sheet: http://localhost:8080/normalize.css',
			// 'msg|inf||loading style sheet: http://localhost:8080/common.css',
			// 'msg|inf||loading style sheet: http://localhost:8080/prince.css',
			'msg|wrn||http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y',
			// 'sta|Preparing document...',
			// 'sta|Converting document...',
			// 'prg|0',
			'msg|inf||used font: Times New Roman, Regular',
			// 'msg|inf||used font: Times New Roman, Bold',
			'dat|total-page-count|1',
			'prg|100',
			// 'msg|inf||loading ICC profile: C:\\Program Files (x86)\\Prince\\engine\\icc\\sRGB_IEC61966-2-1_black_scaled.icc',
			'fin|success'
		];
		var stderrStr = stderrLines.join(EOL);
		var stderr = Buffer.from(stderrStr);
		var logs = Prince.logs(stderr);
		var expected = [
			{type: 'info', source: 'engine/pdf', name: 'status', value: 'Running scripts...'},
			{type: 'warn', source: 'engine/pdf', name: 'warning', value: 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y'},
			{type: 'info', source: 'engine/pdf', name: 'info', value: 'used font: Times New Roman, Regular'},
			{type: 'data', source: 'engine/pdf', name: 'total-page-count', value: '1'},
			{type: 'info', source: 'engine/pdf', name: 'progress-percent', value: '100'},
			{type: 'info', source: 'engine/pdf', name: 'document', value: 'success'}
		];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should accept stderr as type Buffer', function(done) {

		var stderr = Buffer.from('sta|Loading document...');
		var logs = Prince.logs(stderr);
		var expected = [
			{type: 'info', source: 'engine/pdf', name: 'status', value: 'Loading document...'}
		];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should accept stderr as type string', function(done) {

		var stderr = 'sta|Loading document...';
		var logs = Prince.logs(stderr);
		var expected = [
			{type: 'info', source: 'engine/pdf', name: 'status', value: 'Loading document...'}
		];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});

	it('should return empty array when stderr is empty', function(done) {

		var stderr;
		var logs = Prince.logs(stderr);
		var expected = [];

		// Utils.log('* logs:', logs);

		Assert.deepStrictEqual('logs', logs, expected);

		done();
	});
});
