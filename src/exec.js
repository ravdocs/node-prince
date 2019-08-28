'use strict';

var Prove = require('provejs-params');
var ChildProcess = require('child_process');
var Which = require('which');
var ForOwn = require('lodash.forown');
var IsStream = require('is-stream');
var Stopwatch = require('./stopwatch');
var Logs = require('./logs');

var installed = false;
var command = 'prince';

function prunePrinceOptions(options) {
	// prince will throw an error when javascript is set to false
	// prince: false: error: can't open input file: No such file or directory
	if (options.javascript === false) delete options.javascript;
	return options;
}

function toCommand(args) {
	var arr = args.map(function (arg) {
		if (!arg || !arg.indexOf) return arg;
		var isOptionOrBuffer = arg.indexOf('-') === 0;
		if (!isOptionOrBuffer) arg = `'${arg}'`;
		return arg;
	});
	var str = arr.join(' ');
	var cmd = (str) ? `${command} ${str}` : command;
	cmd = cmd.replace(/\\/g, '/');
	return cmd;
}

function parseFirstPrinceError(stderr) {
	// var m = stderr.toString().match(/prince:\s+error:\s+([^\n]+)/);
	var m = stderr.toString().match(/msg\|err\|([^\n]+)/);
	return (m)? m[1].trim() : false;
}

function composeArgs(inputs, output, options, next) {

	Prove('AsOF', arguments);

	var singleInput = (inputs.length === 1);
	var input = (singleInput) ? inputs[0] : null;
	var args = [];

	// prince does not like javascript = false
	options = prunePrinceOptions(options);

	ForOwn(options, function(value, name) {
		var isFlag = (value === true);

		args.push(`--${name}`);
		if (!isFlag) args.push(value);
	});

	if (singleInput && Buffer.isBuffer(input)) {
		args.push('-');
	} else if (singleInput && IsStream.writable(input)) {
		args.push('-');
	} else {
		args = args.concat(inputs);
	}

	// required from Prince 11 on, supported since Prince 7
	args.push('--output');
	args.push(output);

	process.nextTick(next, null, args);
}

function reworkOptions(options, next) {

	Prove('OF', arguments);

	// split off timeout
	var timeout = options.timeout;
	delete options.timeout;

	var defaultsPrince = {
		'input': 'html',
		'profile': 'PDF/A-3b', //<--- eMortgage Standard
		'structured-log': 'buffered', // avoid deadlocks
		'http-timeout': 10 // only load from our servers so 10 seconds is a long time
	};
	var defaultsExec = {
		timeout: 30 * 1000, // millseconds
		maxBuffer: 10 * 1024 * 1024, // megabyte
		encoding: 'buffer'
	};

	var optsPrince = Object.assign({}, defaultsPrince, options);
	var optsExec = Object.assign({}, defaultsExec, {timeout: timeout});

	process.nextTick(next, null, optsPrince, optsExec);
}

function verifyInstall(next) {
	Prove('F', arguments);

	// return early, only need to verify install once
	if (installed) return process.nextTick(next);

	Which(command, function(err) {
		if (err) return next(new Error(`Cannot find prince binary. Verify that prince is installed and is in the PATH.`));
		installed = true;
		next();
	});
}

function runPrince(inputs, args, options, next) {

	Prove('AAOF', arguments);

	var stopwatch = new Stopwatch();

	execCommand(inputs, args, options, function(err, pdf, stderr) {

		// setup
		var msg;
		var encoding = options.encoding;
		var timeout = options.timeout;
		var cmd = toCommand(args);
		var duration = stopwatch.stop(true);
		var meta = {cmd: cmd, duration: duration};
		var isTimeout = (err && err.signal === 'SIGTERM');
		var logs = Logs(stderr);


		// humanize timeout error, and more importantly put humanized
		// timeout error in stderr.
		if (isTimeout) {
			msg = `PDF rendering timed out after '${timeout}' milliseconds.`;
			err = new Error(msg);
			err.cmd = cmd;
			stderr = (encoding === 'buffer')
				? Buffer.from(msg)
				: Buffer.from(msg).toString(encoding);
			logs.push({type: 'error', source: 'engine/pdf', name: 'error', value: msg});
		}

		// humanize prince `err` to just the first structure log error entry in `stderr`
		if (err) {
			msg = parseFirstPrinceError(stderr);
			if (msg) err = new Error(msg);
		}

		// final cleanup
		meta.output = stderr.toString();

		// return result
		return next(err, pdf, logs, meta);
	});
}

function execCommand(inputs, args, options, next) {

	Prove('AAOF', arguments);

	var singleInput = (inputs.length === 1);
	var input = (singleInput) ? inputs[0] : null;

	var exec = ChildProcess.execFile(command, args, options, next);

	if (singleInput && Buffer.isBuffer(input)) {
		exec.stdin.end(input);
	} else if (singleInput && IsStream.writable(input)) {
		input.pipe(exec.stdin);
	}
}

module.exports = function(inputs, output, options, next) {

	inputs = inputs || [];
	options = options || {};

	Prove('*soF', arguments);

	if (!Array.isArray(inputs)) inputs = [inputs];

	reworkOptions(options, function(err, optsPrince, optsExec) {
		if (err) return next(err);

		composeArgs(inputs, output, optsPrince, function(err, args) {
			if (err) return next(err);

			verifyInstall(function(err) {
				if (err) return next(err);

				runPrince(inputs, args, optsExec, function(err, pdf, logs, meta) {
					if (err) return next(err, pdf, logs, meta);

					next(null, pdf, logs, meta);
				});
			});
		});
	});
};
