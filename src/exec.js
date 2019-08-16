'use strict';

var Prove = require('provejs-params');
var ChildProcess = require('child_process');
var Which = require('which');
var SI = require('systeminformation');
var ForOwn = require('lodash.forown');
var Stopwatch = require('./stopwatch');

var installed = false;
var command = 'prince';

function prunePrinceOptions(options) {

	// prince will throw an error when javascript is set to false
	// prince: false: error: can't open input file: No such file or directory
	if (options.javascript === false) delete options.javascript;
	return options;
}

function memory(next) {
	SI.mem().then(function (mem) {
		next(null, mem);
	}).catch(next);
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


function toMeta(args, duration, mem1, mem2) {

	Prove('A*OO', arguments);

	var meta = {
		cmd: toCommand(args),
		duration: duration,
		memory: {
			before: mem1,
			after: mem2
		}
	};

	return meta;
}

// If command timed out, i.e., errExec but no stderr, populate stderr with
// an error message.
function toStdErr(stderr, errExec, encoding) {

	Prove('*eS', arguments);

	// return early
	if (!errExec) return stderr;
	var timedout = (!stderr.toString().length);
	if (!timedout) return stderr;

	var msg = `msg|err|${command} timed out`;

	return (encoding === 'buffer')
		? Buffer.from(msg)
		: Buffer.from(msg).toString(encoding);
}

// If command timed out, i.e., errExec.signal is SIGTERM, say so in the error
// message.
function toErrExec(errExec) {

	Prove('e', arguments);

	// return early
	if (!errExec) return null;

	var timedout = (errExec.signal === 'SIGTERM');
	if (timedout) {
		errExec.message = `${command} timed out: ${errExec.message}`;
		errExec.timedout = true;
	}

	return errExec;
}

function composeArgs(inputs, output, princeOptions, next) {

	Prove('AsOF', arguments);

	var args = [];

	// prince does not like javascript = false
	princeOptions = prunePrinceOptions(princeOptions);

	ForOwn(princeOptions, function(value, name) {
		var isFlag = (value === true);

		args.push(`--${name}`);
		if (!isFlag) args.push(value);
	});

	args = args.concat(inputs);

	// required from Prince 11 on, supported since Prince 7
	args.push('--output');
	args.push(output);

	process.nextTick(next, null, args);
}

function applyDefaults(options, next) {

	Prove('OF', arguments);
	var defaults = {
		'timeout': 30 * 1000, // millseconds
		'maxBuffer': 10 * 1024 * 1024, // megabyte
		'encoding': 'buffer',
		'profile': 'PDF/A-3b', //<--- eMortgage Standard
		'structured-log': 'buffered', // avoid deadlocks
		'http-timeout': 10 // only load from our servers so 10 seconds is a long time
	};
	options = Object.assign({}, defaults, options);
	process.nextTick(next, null, options);
}

function verifyInstall(next) {
	Prove('F', arguments);
	Which(command, function(err) {
		if (err) return next(new Error(`Cannot find "${command}" binary. Verify that "${command}" is installed and is in the PATH.`));
		installed = true;
		next();
	});
}

function noopInstall(next) {
	process.nextTick(next);
}

function execute(args, options, next) {

	Prove('AOF', arguments);

	memory(function(err, mem1) {
		if (err) return next(err);

		var stopwatch = new Stopwatch();

		ChildProcess.execFile(command, args, options, function(errExec, stdout, stderr) {
			// handle error below - do not stop on errExec

			var duration = stopwatch.stop(true);

			memory(function(err, mem2) {
				if (err) return next(err);

				var meta = toMeta(args, duration, mem1, mem2);
				var stderr2 = toStdErr(stderr, errExec, options.encoding);
				var errExec2 = toErrExec(errExec);

				// return early
				if (errExec2) return next(errExec2, stdout, stderr2, meta);

				// todo: If Prince returns an error status code in this scenario, then
				// this condition will never be true, making this code unnecessary.
				var m = stderr.toString().match(/prince:\s+error:\s+([^\n]+)/);
				if (m) return next(new Error(m[1]), stdout, stderr, meta);

				next(null, stdout, stderr, meta);
			});
		});
	});
}

module.exports = function(inputs, output, princeOptions, execFileOptions, next) {

	Prove('*sooF', arguments);

	if (!inputs) inputs = [];
	if (!Array.isArray(inputs)) inputs = [inputs];
	if (!princeOptions) princeOptions = {};
	if (!execFileOptions) execFileOptions = {};
	var checkInstall = (installed)? noopInstall : verifyInstall;

	composeArgs(inputs, output, princeOptions, function(err, args) {
		if (err) return next(err);

		applyDefaults(execFileOptions, function(err, execFileOptions) {
			if (err) return next(err);

			checkInstall(function(err) {
				if (err) return next(err);

				execute(args, execFileOptions, function(err, stdout, stderr, meta) {
					if (err) return next(err, stdout, stderr, meta);

					next(null, stdout, stderr, meta);
				});
			});
		});
	});
};
