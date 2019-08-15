'use strict';

var Prove = require('provejs-params');
var ChildProcess = require('child_process');
var Which = require('which');
var Free = require('free-memory');
var _ = {};
_.forOwn = require('lodash.forown');

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

function prunePrinceOptions(options) {

	// prince will throw an error when javascript is set to false
	// prince: false: error: can't open input file: No such file or directory
	if (options.javascript === false) delete options.javascript;
	return options;
}

module.exports = function(inputs, output, princeOptions, execFileOptions, next) {

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

	// prince does not like javascript = false
	princeOptions = prunePrinceOptions(princeOptions);

	_.forOwn(princeOptions, function(value, name) {
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
		timeout: 30 * SECOND,
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

	exports._memoryFree(function(err, memoryFreeBefore) {
		if (err) memoryFreeBefore = 0; // do not stop if memory cannot be measured

		var min = process.hrtime.bigint();

		ChildProcess.execFile(BINARY, args, options, function(errExec, stdout, stderr) {
			// handle error below - do not stop on errExec

			var duration = exports._secondsSince(min);

			exports._memoryFree(function(errMem, memoryFreeAfter) {
				if (errMem) memoryFreeAfter = 0; // do not stop if memory cannot be measured

				var meta = exports._meta(args, duration, memoryFreeBefore, memoryFreeAfter);
				stderr = exports._stderr(stderr, errExec, options.encoding);
				errExec = exports._errExec(errExec);

				if (errExec) return next(errExec, stdout, stderr, meta);

				// todo: If Prince returns an error status code in this scenario, then
				// this condition will never be true, making this code unnecessary.
				var m = stderr.toString().match(/prince:\s+error:\s+([^\n]+)/);
				if (m) return next(new Error(m[1]), stdout, stderr, meta);

				next(null, stdout, stderr, meta);
			});
		});
	});
};

exports._meta = function(args, duration, memoryFreeBefore, memoryFreeAfter) {

	Prove('A*NN', arguments);

	var argsStr = args.join(' ');
	var cmd = (argsStr) ? `${BINARY} ${argsStr}` : BINARY;

	var meta = {
		cmd: cmd,
		duration: duration,
		memoryFreeBefore: memoryFreeBefore,
		memoryFreeAfter: memoryFreeAfter
	};

	return meta;
};

// If command timed out, i.e., errExec but no stderr, populate stderr with
// an error message.
exports._stderr = function(stderr, errExec, encoding) {

	Prove('*eS', arguments);

	// return early
	if (!errExec) return stderr;
	var timedout = (!stderr.toString().length);
	if (!timedout) return stderr;

	var msg = `msg|err|${BINARY} timed out`;

	return (encoding === 'buffer')
		? Buffer.from(msg)
		: Buffer.from(msg).toString(encoding);
};

// If command timed out, i.e., errExec.signal is SIGTERM, say so in the error
// message.
exports._errExec = function(errExec) {

	Prove('e', arguments);

	// return early
	if (!errExec) return null;

	var timedout = (errExec.signal === 'SIGTERM');
	if (timedout) {
		errExec.message = `${BINARY} timed out: ${errExec.message}`;
		errExec.timedout = true;
	}

	return errExec;
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

exports._memoryFree = function(next) {

	Prove('F', arguments);

	switch (process.platform) {
		case 'win32': return exports._memoryFreeWindows(next);
		default: return exports._memoryFreeUnix(next);
	}
};

exports._memoryFreeWindows = function(next) {

	Prove('F', arguments);

	// Windows is not supported currently.
	next(null, 0);
};

exports._memoryFreeUnix = function(next) {

	Prove('F', arguments);

	var KIBIBYTE = 1;
	var MEBIBYTE = 1024 * KIBIBYTE;

	Free(function(err, info) {
		if (err) return next(err);

		var free = info.mem.free;
		var freeMib = free / MEBIBYTE;

		next(null, freeMib);
	});
};
