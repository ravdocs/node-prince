/* eslint-env mocha */
'use strict';

var OS = require('os');
var Prince = require('..');
var Utils = require('./utils');

describe('Prince.parseStderr()', function() {

	it('should parse \'sta|...\' lines correctly', function(done) {

		var stderr = Buffer.from('sta|Loading document...');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'status', 'rows[0].type');
		Utils.is(rows[0].name, '', 'rows[0].name');
		Utils.is(rows[0].value, 'Loading document...', 'rows[0].value');

		done();
	});

	it('should parse \'msg|err|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|err|Test error');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'error', 'rows[0].name');
		Utils.is(rows[0].value, 'Test error', 'rows[0].value');

		done();
	});

	it('should parse \'msg|wrn|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|wrn|http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'warning', 'rows[0].name');
		Utils.is(rows[0].value, 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y', 'rows[0].value');

		done();
	});

	it('should parse \'msg|inf|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|inf|loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'info', 'rows[0].name');
		Utils.is(rows[0].value, 'loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'rows[0].value');

		done();
	});

	it('should parse \'msg|dbg|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|dbg|loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'debug', 'rows[0].name');
		Utils.is(rows[0].value, 'loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'rows[0].value');

		done();
	});

	it('should parse \'msg|out|...\' lines correctly', function(done) {

		var stderr = Buffer.from('msg|out|Some message from console.log');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'output', 'rows[0].name');
		Utils.is(rows[0].value, 'Some message from console.log', 'rows[0].value');

		done();
	});

	it('should parse \'prg|...\' lines correctly', function(done) {

		var stderr = Buffer.from('prg|0');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'progress', 'rows[0].type');
		Utils.is(rows[0].name, 'percent', 'rows[0].name');
		Utils.is(rows[0].value, '0', 'rows[0].value');

		done();
	});

	it('should parse \'dat|...|...\' lines correctly', function(done) {

		var stderr = Buffer.from('dat|key|val');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'data', 'rows[0].type');
		Utils.is(rows[0].name, 'key', 'rows[0].name');
		Utils.is(rows[0].value, 'val', 'rows[0].value');

		done();
	});

	it('should parse \'fin|success\' lines correctly', function(done) {

		var stderr = Buffer.from('fin|success');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'final', 'rows[0].type');
		Utils.is(rows[0].name, 'outcome', 'rows[0].name');
		Utils.is(rows[0].value, 'success', 'rows[0].value');

		done();
	});

	it('should parse \'fin|failure\' lines correctly', function(done) {

		var stderr = Buffer.from('fin|failure');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'final', 'rows[0].type');
		Utils.is(rows[0].name, 'outcome', 'rows[0].name');
		Utils.is(rows[0].value, 'failure', 'rows[0].value');

		done();
	});

	it('should handle bug where \'msg|err|...\' is formatted as \'msg|err||...\'', function(done) {

		var stderr = Buffer.from('msg|err||Test error');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'error', 'rows[0].name');
		Utils.is(rows[0].value, 'Test error', 'rows[0].value');

		done();
	});

	it('should handle bug where \'msg|wrn|...\' is formatted as \'msg|wrn||...\'', function(done) {

		var stderr = Buffer.from('msg|wrn||http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'warning', 'rows[0].name');
		Utils.is(rows[0].value, 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y', 'rows[0].value');

		done();
	});

	it('should handle bug where \'msg|inf|...\' is formatted as \'msg|inf||...\'', function(done) {

		var stderr = Buffer.from('msg|inf||loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'info', 'rows[0].name');
		Utils.is(rows[0].value, 'loading document: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'rows[0].value');

		done();
	});

	it('should handle bug where \'msg|dbg|...\' is formatted as \'msg|dbg||...\'', function(done) {

		var stderr = Buffer.from('msg|dbg||loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat');

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 1, 'rows.length');

		Utils.isObject(rows[0], 'rows[0]');
		Utils.isString(rows[0].type, 'rows[0].type');
		Utils.isString(rows[0].name, 'rows[0].name');
		Utils.isString(rows[0].value, 'rows[0].value');

		Utils.is(rows[0].type, 'message', 'rows[0].type');
		Utils.is(rows[0].name, 'debug', 'rows[0].name');
		Utils.is(rows[0].value, 'loading license: C:\\Program Files (x86)\\Prince\\engine\\license\\license.dat', 'rows[0].value');

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

		var rows = Prince.parseStderr(stderr);

		// Utils.log('* rows:', rows);

		Utils.isArray(rows, 'rows');
		Utils.is(rows.length, 6, 'rows.length');

		rows.forEach(function(row, i) {
			Utils.isObject(row, `rows[${i}]`);
			Utils.isString(row.type, `rows[${i}].type`);
			Utils.isString(row.name, `rows[${i}].name`);
			Utils.isString(row.value, `rows[${i}].value`);
		});

		Utils.is(rows[0].type, 'status', 'rows[0].type');
		Utils.is(rows[0].name, '', 'rows[0].name');
		Utils.is(rows[0].value, 'Running scripts...', 'rows[0].value');

		Utils.is(rows[1].type, 'message', 'rows[1].type');
		Utils.is(rows[1].name, 'warning', 'rows[1].name');
		Utils.is(rows[1].value, 'http://localhost:8080/common.css|unsupported properties: box-shadow, overflow-y', 'rows[1].value');

		Utils.is(rows[2].type, 'message', 'rows[2].type');
		Utils.is(rows[2].name, 'info', 'rows[2].name');
		Utils.is(rows[2].value, 'used font: Times New Roman, Regular', 'rows[2].value');

		Utils.is(rows[3].type, 'data', 'rows[3].type');
		Utils.is(rows[3].name, 'total-page-count', 'rows[3].name');
		Utils.is(rows[3].value, '1', 'rows[3].value');

		Utils.is(rows[4].type, 'progress', 'rows[4].type');
		Utils.is(rows[4].name, 'percent', 'rows[4].name');
		Utils.is(rows[4].value, '100', 'rows[4].value');

		Utils.is(rows[5].type, 'final', 'rows[5].type');
		Utils.is(rows[5].name, 'outcome', 'rows[5].name');
		Utils.is(rows[5].value, 'success', 'rows[5].value');

		done();
	});
});
