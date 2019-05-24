/*
**  node-prince -- Node API for executing PrinceXML via prince(1) CLI
**  Copyright (c) 2014-2018 Ralf S. Engelschall <rse@engelschall.com>
**  Copyright (c) 2018-2019 RAVdocs
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  'Software'), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
'use strict';

var ChildProcess = require('child_process');
var ForOwn = require('lodash.forown');
var Which = require('which');

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

				exports._exec(args, execFileOptions, function(err, stdout, stderr) {
					if (err) return next(err, stdout, stderr);

					next(null, stdout, stderr);
				});
			});
		});
	});
};

exports._args = function(inputs, output, princeOptions, next) {

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

	Which(BINARY, function(err) {
		if (err) return next(new Error(`Cannot find "${BINARY}" binary. Verify that "${BINARY}" is installed and is in the PATH.`));

		next();
	});
};

exports._exec = function(args, options, next) {

	ChildProcess.execFile(BINARY, args, options, function(err, stdout, stderr) {
		if (err) return next(err, stdout, stderr);

		var m = stderr.toString().match(/prince:\s+error:\s+([^\n]+)/);

		if (m) return next(new Error(m[1]), stdout, stderr);

		next(null, stdout, stderr);
	});
};
