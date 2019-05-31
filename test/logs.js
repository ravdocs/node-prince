/* eslint-env mocha */
'use strict';

var OS = require('os');
var Prince = require('..');
var Utils = require('./utils');

describe('Prince.logs()', function() {

	it('should parse \'sta|...\' lines correctly', function(done) {

		var stderr = Buffer.from('sta|Loading document...');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'status', 'logs[0].type');
		Utils.is(logs[0].name, '', 'logs[0].name');
		Utils.is(logs[0].value, 'Loading document...', 'logs[0].value');

		done();
	});

	it('should parse \'msg|err|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|err|Test error');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'error', 'logs[0].name');
		Utils.is(logs[0].value, 'Test error', 'logs[0].value');

		done();
	});

	it('should parse \'msg|wrn|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|wrn|http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'warning', 'logs[0].name');
		Utils.is(logs[0].value, 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y', 'logs[0].value');

		done();
	});

	it('should parse \'msg|inf|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|inf|loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'info', 'logs[0].name');
		Utils.is(logs[0].value, 'loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'logs[0].value');

		done();
	});

	it('should parse \'msg|dbg|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|dbg|loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'debug', 'logs[0].name');
		Utils.is(logs[0].value, 'loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'logs[0].value');

		done();
	});

	it('should parse \'msg|out|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|out|Some message from console.log');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'output', 'logs[0].name');
		Utils.is(logs[0].value, 'Some message from console.log', 'logs[0].value');

		done();
	});

	it('should parse \'prg|...\' lines correctly', function(done) {

		var stderr = Buffer.from('prg|0');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'progress', 'logs[0].type');
		Utils.is(logs[0].name, 'percent', 'logs[0].name');
		Utils.is(logs[0].value, '0', 'logs[0].value');

		done();
	});

	it('should parse \'dat|...|...\' lines correctly', function(done) {

		var stderr = Buffer.from('dat|key|val');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'data', 'logs[0].type');
		Utils.is(logs[0].name, 'key', 'logs[0].name');
		Utils.is(logs[0].value, 'val', 'logs[0].value');

		done();
	});

	it('should parse \'fin|success\' lines correctly', function(done) {

		var stderr = Buffer.from('fin|success');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'final', 'logs[0].type');
		Utils.is(logs[0].name, 'outcome', 'logs[0].name');
		Utils.is(logs[0].value, 'success', 'logs[0].value');

		done();
	});

	it('should parse \'fin|failure\' lines correctly', function(done) {

		var stderr = Buffer.from('fin|failure');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'final', 'logs[0].type');
		Utils.is(logs[0].name, 'outcome', 'logs[0].name');
		Utils.is(logs[0].value, 'failure', 'logs[0].value');

		done();
	});

	it('should handle bug where \'msg|err|...\' is formatted as \'msg|err||...\'', function(done) {

		var stderr = Buffer.from('msg|err||Test error');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'error', 'logs[0].name');
		Utils.is(logs[0].value, 'Test error', 'logs[0].value');

		done();
	});

	it('should handle bug where \'msg|wrn|...\' is formatted as \'msg|wrn||...\'', function(done) {

		var stderr = Buffer.from('msg|wrn||http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'warning', 'logs[0].name');
		Utils.is(logs[0].value, 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y', 'logs[0].value');

		done();
	});

	it('should handle bug where \'msg|inf|...\' is formatted as \'msg|inf||...\'', function(done) {

		var stderr = Buffer.from('msg|inf||loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'info', 'logs[0].name');
		Utils.is(logs[0].value, 'loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'logs[0].value');

		done();
	});

	it('should handle bug where \'msg|dbg|...\' is formatted as \'msg|dbg||...\'', function(done) {

		var stderr = Buffer.from('msg|dbg||loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var logs = Prince.logs(stderr);

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 1, 'logs.length');

		Utils.isObject(logs[0], 'logs[0]');
		Utils.isString(logs[0].type, 'logs[0].type');
		Utils.isString(logs[0].name, 'logs[0].name');
		Utils.isString(logs[0].value, 'logs[0].value');

		Utils.is(logs[0].type, 'message', 'logs[0].type');
		Utils.is(logs[0].name, 'debug', 'logs[0].name');
		Utils.is(logs[0].value, 'loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'logs[0].value');

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

		// Utils.log('* logs:', logs);

		Utils.isArray(logs, 'logs');
		Utils.is(logs.length, 6, 'logs.length');

		logs.forEach(function(log, i) {
			Utils.isObject(log, `logs[${i}]`);
			Utils.isString(log.type, `logs[${i}].type`);
			Utils.isString(log.name, `logs[${i}].name`);
			Utils.isString(log.value, `logs[${i}].value`);
		});

		Utils.is(logs[0].type, 'status', 'logs[0].type');
		Utils.is(logs[0].name, '', 'logs[0].name');
		Utils.is(logs[0].value, 'Running scripts...', 'logs[0].value');

		Utils.is(logs[1].type, 'message', 'logs[1].type');
		Utils.is(logs[1].name, 'warning', 'logs[1].name');
		Utils.is(logs[1].value, 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y', 'logs[1].value');

		Utils.is(logs[2].type, 'message', 'logs[2].type');
		Utils.is(logs[2].name, 'info', 'logs[2].name');
		Utils.is(logs[2].value, 'used font: Times New Roman, Regular', 'logs[2].value');

		Utils.is(logs[3].type, 'data', 'logs[3].type');
		Utils.is(logs[3].name, 'total-page-count', 'logs[3].name');
		Utils.is(logs[3].value, '1', 'logs[3].value');

		Utils.is(logs[4].type, 'progress', 'logs[4].type');
		Utils.is(logs[4].name, 'percent', 'logs[4].name');
		Utils.is(logs[4].value, '100', 'logs[4].value');

		Utils.is(logs[5].type, 'final', 'logs[5].type');
		Utils.is(logs[5].name, 'outcome', 'logs[5].name');
		Utils.is(logs[5].value, 'success', 'logs[5].value');

		done();
	});
});
