'use strict';

var ChildProcess = require('child_process');
var OS = require('os');
var Prove = require('provejs-params');
var ForOwn = require('lodash.forown');
var Which = require('which');
var Pkg = require('../package.json');

var BINARY = 'prince';

// // the officially support options of prince(1)
// var PRINCE_OPTIONS = {
// 	'help': false,
// 	'version': false,
// 	'credits': false,
// 	'verbose': false,
// 	'debug': false,
// 	'log': true,
// 	'no-warn-css': false,
// 	'no-warn-css-unknown': false,
// 	'no-warn-css-unsupported': false,
// 	'input': true,
// 	'input-list': true,
// 	'baseurl': true,
// 	// 'remap': true,
// 	'fileroot': true,
// 	'xinclude': false,
// 	'xml-external-entities': false,
// 	'no-local-files': false,
// 	'no-network': false,
// 	'auth-user': true,
// 	'auth-password': true,
// 	'auth-server': true,
// 	'auth-scheme': true,
// 	'auth-method': true,
// 	'auth': true,
// 	'no-auth-preemptive': false,
// 	'http-proxy': true,
// 	'http-timeout': true,
// 	'cookie': true,
// 	'cookiejar': true,
// 	'ssl-cacert': true,
// 	'ssl-capath': true,
// 	'ssl-cert': true,
// 	'ssl-cert-type': true,
// 	'ssl-key': true,
// 	'ssl-key-type': true,
// 	'ssl-key-password': true,
// 	'ssl-version': true,
// 	'insecure': false,
// 	'no-parallel-downloads': false,
// 	'javascript': false,
// 	'script': true,
// 	'style': true,
// 	'media': true,
// 	'page-size': true,
// 	'page-margin': true,
// 	'no-author-style': false,
// 	'no-default-style': false,
// 	'output': true,
// 	'pdf-profile': true,
// 	'pdf-xmp': true,
// 	'pdf-output-intent': true,
// 	'pdf-lang': true,
// 	'attach': true,
// 	'tagged-pdf': false,
// 	'no-artificial-fonts': false,
// 	'no-embed-fonts': false,
// 	'no-subset-fonts': false,
// 	'force-identity-encoding': false,
// 	'no-compress': false,
// 	'no-object-streams': false,
// 	'convert-colors': false,
// 	'fallback-cmyk-profile': true,
// 	'pdf-title': true,
// 	'pdf-subject': true,
// 	'pdf-author': true,
// 	'pdf-keywords': true,
// 	'pdf-creator': true,
// 	'encrypt': false,
// 	'key-bits': true,
// 	'user-password': true,
// 	'owner-password': true,
// 	'disallow-print': false,
// 	'disallow-copy': false,
// 	'disallow-annotate': false,
// 	'disallow-modify': false,
// 	'raster-output': true,
// 	'raster-format': true,
// 	'raster-pages': true,
// 	'raster-dpi': true,
// 	'raster-background': true,
// 	'raster-threads': true,
// 	'scanfonts': false,
// 	'control': false,

// 	// undocumented options
// 	'prefix': true,
// 	'license-file': true
// };

exports.exec = function(inputs, output, princeOptions, execFileOptions, next) {

	Prove('*sooF', arguments);

	if (!inputs) inputs = [];
	if (!Array.isArray(inputs)) inputs = [inputs];
	if (!princeOptions) princeOptions = {};
	if (!execFileOptions) execFileOptions = {};

	exports._args(inputs, output, princeOptions, function(err, args) {
		if (err) return next(err);

		exports._execFileOptions(execFileOptions, function(err, execFileOptions) {
			if (err) return next(err);

			exports._verifyInstalled(function(err) {
				if (err) return next(err);

				exports._exec(args, execFileOptions, function(err, stdout, stderr, meta) {
					if (err) return next(err, stdout, stderr, meta);

					next(null, stdout, stderr, meta);
				});
			});
		});
	});
};

exports._args = function(inputs, output, princeOptions, next) {

	Prove('AsOF', arguments);

	var args = [];

	ForOwn(princeOptions, function(value, name) {
		var isFlag = (value === true);

		args.push(`--${name}`);
		if (!isFlag) args.push(value);
	});

	args = args.concat(inputs);

	// required from Prince 11 on, supported since Prince 7
	args.push('--output');
	args.push(output);

	next(null, args);
};

exports._execFileOptions = function(execFileOptions, next) {

	Prove('OF', arguments);

	var MILLISECOND = 1;
	var SECOND = 1000 * MILLISECOND;

	var BYTE = 1;
	var KIBIBYTE = 1024 * BYTE;
	var MEBIBYTE = 1024 * KIBIBYTE;

	var execFileDefaults = {
		timeout: 10 * SECOND,
		maxBuffer: 10 * MEBIBYTE,
		encoding: 'buffer'
	};

	execFileOptions = Object.assign({}, execFileDefaults, execFileOptions);

	next(null, execFileOptions);
};

exports._verifyInstalled = function(next) {

	Prove('F', arguments);

	Which(BINARY, function(err) {
		if (err) return next(new Error(`Cannot find "${BINARY}" binary. Verify that "${BINARY}" is installed and is in the PATH.`));

		next();
	});
};

exports._exec = function(args, options, next) {

	Prove('AOF', arguments);

	var min = process.hrtime.bigint();
	var memoryBefore = exports._heapUsedInMib();

	ChildProcess.execFile(BINARY, args, options, function(err, stdout, stderr) {
		var meta = exports._meta(min, memoryBefore);

		if (err) return next(err, stdout, stderr, meta);

		var m = stderr.toString().match(/prince:\s+error:\s+([^\n]+)/);

		if (m) return next(new Error(m[1]), stdout, stderr, meta);

		next(null, stdout, stderr, meta);
	});
};

exports._meta = function(min, memoryBefore) {

	Prove('*N', arguments);

	var meta = {
		duration: exports._secondsSince(min),
		memoryBefore: memoryBefore,
		memoryAfter: exports._heapUsedInMib()
	};

	return meta;
};

exports._secondsSince = function(min) {

	Prove('*', arguments);

	var max = process.hrtime.bigint();

	var NANOSECOND = 1;
	var MICROSECOND = NANOSECOND * 1000;
	var MILLISECOND = MICROSECOND * 1000;
	var SECOND = MILLISECOND * 1000;

	var elapsedBigInt = max - min;
	var elapsedNanoseconds = Number(elapsedBigInt);
	var elapsedSeconds = elapsedNanoseconds / SECOND;

	return elapsedSeconds;
};

exports._heapUsedInMib = function() {

	// Prove('', arguments);

	var BYTE = 1;
	var KIBIBYTE = 1024 * BYTE;
	var MEBIBYTE = 1024 * KIBIBYTE;

	var memoryUsage = process.memoryUsage();
	var heapUsed = memoryUsage.heapUsed;
	var heapUsedMib = heapUsed / MEBIBYTE;

	return heapUsedMib;
};

exports.version = function(next) {

	Prove('F', arguments);

	var princeOptions = {
		version: true
	};

	exports.exec(null, null, princeOptions, null, function(err, stdout) {
		if (err) return next(err);

		exports._versionInfo(stdout, function(err, info) {
			if (err) return next(err);

			next(null, info);
		});
	});
};

exports._versionInfo = function(stdout, next) {

	Prove('*F', arguments);

	var EOL= OS.EOL;
	var pkgName = Pkg.name;
	var pkgVersion = Pkg.version;

	var info = stdout.toString();
	info = exports._trimSuffix(info, EOL); // remove trailing '\r\n' or '\n'
	info = `${pkgName} ${pkgVersion}${EOL}${info}`;

	next(null, info);
};

exports._trimSuffix = function(str, suffix) {

	Prove('SS', arguments);

	if (!str.endsWith(suffix)) return str;

	var iBeforeSuffix = -suffix.length;
	var trimmed = str.slice(0, iBeforeSuffix);

	return trimmed;
};

exports.parseStderr = function(stderr) {

	Prove('*', arguments);

	if (Buffer.isBuffer(stderr)) stderr = stderr.toString();
	if (typeof stderr !== 'string') return;

	stderr = stderr.replace(/^msg\|((err)|(wrn)|(inf)|(dbg))\|\|/mg, 'msg|$1|'); // workaround for current bug where message is 'msg|...||...' instead of 'msg|...|...'
	var lines = stderr.split(/\r?\n/);
	var rows = lines.map(exports._stderrRow);
	rows = exports._compact(rows); // remove any rows whose lines were not parsable

	return rows;
};

exports._compact = function(arr) {

	Prove('A', arguments);

	return arr.filter(function(val) {
		return (!!val);
	});
};

exports._stderrRow = function(line) {

	Prove('SNA', arguments);

	var parts = line.split('|');

	switch (parts[0]) {
		case 'sta': return exports._stderrRowStatus(parts);
		case 'msg': return exports._stderrRowMessage(parts);
		case 'prg': return exports._stderrRowProgress(parts);
		case 'dat': return exports._stderrRowData(parts);
		case 'fin': return exports._stderrRowFinal(parts);
		default: return null;
	}
};

// 'sta|...' is a status message.
exports._stderrRowStatus = function(parts) {

	Prove('A', arguments);

	return {
		type: 'status',
		name: '',
		value: parts[1]
	};
};

// 'msg|...|...' is a message.
// It is one of the following:
// - 'msg|err|...': error message
// - 'msg|wrn|...': warning message
// - 'msg|inf|...': information message
// - 'msg|dbg|...': debug message
// - 'msg|out|...': console output from `console.log()`
// Note: Currently (Prince 12), 'msg|err|...', 'msg|wrn|...', 'msg|inf|...',
// and 'msg|dbg|...' are formatted incorrectly as 'msg|...||...'.
exports._stderrRowMessage = function(parts) {

	Prove('A', arguments);

	return {
		type: 'message',
		name: exports._stderrRowMessageName(parts[1]),
		value: exports._stderrRowValue(parts, 2)
	};
};

exports._stderrRowMessageName = function(abbr) {

	Prove('S', arguments);

	switch (abbr) {
		case 'err': return 'error';
		case 'wrn': return 'warning';
		case 'inf': return 'info';
		case 'dbg': return 'debug';
		case 'out': return 'output';
	}
};

// The parts are a line split by '|'.
// Usually, the value will be the last part.
// However, the value may have had one or more '|' in it, and, if so, the
// value will have been split into multiple parts. In this case, they must
// be rejoined by '|'.
exports._stderrRowValue = function(parts, i) {

	Prove('AN', arguments);

	return parts.slice(i).join('|');
};

// 'prg|...' is a progress percentage.
// It is in the format 'prg|{{percent}}', where '{{percent}}' is 0, 100, or any
// number in between.
exports._stderrRowProgress = function(parts) {

	Prove('A', arguments);

	return {
		type: 'progress',
		name: 'percent',
		value: parts[1]
	};
};

// 'dat|name|value' is a data message produced by `Log.data("name", "value")`.
exports._stderrRowData = function(parts) {

	Prove('A', arguments);

	return {
		type: 'data',
		name: parts[1],
		value: exports._stderrRowValue(parts, 2)
	};
};

// 'fin|...' is the final outcome.
// It is one of the following:
// - 'fin|success'
// - 'fin|failure'
exports._stderrRowFinal = function(parts) {

	Prove('A', arguments);

	return {
		type: 'final',
		name: 'outcome',
		value: parts[1]
	};
};
