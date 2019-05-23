/*
**  node-prince -- Node API for executing PrinceXML via prince(1) CLI
**  Copyright (c) 2014-2018 Ralf S. Engelschall <rse@engelschall.com>
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

/*
 *  prince-api.js: Node run-time API
 */
'use strict';

var ChildProcess = require('child_process');
var Promise = require('promise');
var ForOwn = require('lodash.forown');
var Which = require('which');

var BINARY = 'prince';

// the officially support options of prince(1)
var PRINCE_OPTIONS = {
	'help': false,
	'version': false,
	'credits': false,
	'verbose': false,
	'debug': false,
	'log': true,
	'no-warn-css': false,
	'no-warn-css-unknown': false,
	'no-warn-css-unsupported': false,
	'input': true,
	'input-list': true,
	'baseurl': true,
	// 'remap': true,
	'fileroot': true,
	'xinclude': false,
	'xml-external-entities': false,
	'no-local-files': false,
	'no-network': false,
	'auth-user': true,
	'auth-password': true,
	'auth-server': true,
	'auth-scheme': true,
	'auth-method': true,
	'auth': true,
	'no-auth-preemptive': false,
	'http-proxy': true,
	'http-timeout': true,
	'cookie': true,
	'cookiejar': true,
	'ssl-cacert': true,
	'ssl-capath': true,
	'ssl-cert': true,
	'ssl-cert-type': true,
	'ssl-key': true,
	'ssl-key-type': true,
	'ssl-key-password': true,
	'ssl-version': true,
	'insecure': false,
	'no-parallel-downloads': false,
	'javascript': false,
	'script': true,
	'style': true,
	'media': true,
	'page-size': true,
	'page-margin': true,
	'no-author-style': false,
	'no-default-style': false,
	'output': true,
	'pdf-profile': true,
	'pdf-xmp': true,
	'pdf-output-intent': true,
	'pdf-lang': true,
	'attach': true,
	'tagged-pdf': false,
	'no-artificial-fonts': false,
	'no-embed-fonts': false,
	'no-subset-fonts': false,
	'force-identity-encoding': false,
	'no-compress': false,
	'no-object-streams': false,
	'convert-colors': false,
	'fallback-cmyk-profile': true,
	'pdf-title': true,
	'pdf-subject': true,
	'pdf-author': true,
	'pdf-keywords': true,
	'pdf-creator': true,
	'encrypt': false,
	'key-bits': true,
	'user-password': true,
	'owner-password': true,
	'disallow-print': false,
	'disallow-copy': false,
	'disallow-annotate': false,
	'disallow-modify': false,
	'raster-output': true,
	'raster-format': true,
	'raster-pages': true,
	'raster-dpi': true,
	'raster-background': true,
	'raster-threads': true,
	'scanfonts': false,
	'control': false,

	// undocumented options
	'prefix': true,
	'license-file': true
};

// API constructor
function Prince (options) {
	// optionally on-the-fly generate an instance
	if (!(this instanceof Prince)) return new Prince(options);

	var MILLISECOND = 1;
	var SECOND = 1000 * MILLISECOND;

	var BYTE = 1;
	var KIBIBYTE = 1024 * BYTE;
	var MEBIBYTE = 1024 * KIBIBYTE;

	// create default configuration
	this.config = {
		license: '',
		timeout: 10 * SECOND,
		maxbuffer: 10 * MEBIBYTE,
		cwd: '.',
		option: {},
		inputs: [],
		cookies: [],
		output: ''
	};

	// allow caller to override defaults
	if (typeof options === 'object') {
		if (typeof options.inputs !== 'undefined') this.inputs(options.inputs);
		if (typeof options.cookies !== 'undefined') this.cookies(options.cookies);
		if (typeof options.output !== 'undefined') this.output(options.output);
	}

	return this;
}

// set path to license file
Prince.prototype.license = function(filename) {
	if (arguments.length !== 1) throw new Error('Prince#license: invalid number of arguments');
	this.config.license = filename;
	return this;
};

// set timeout for CLI execution
Prince.prototype.timeout = function(timeout) {
	if (arguments.length !== 1) throw new Error('Prince#timeout: invalid number of arguments');
	this.config.timeout = timeout;
	return this;
};

// set maxmimum stdout/stderr buffer for CLI execution
Prince.prototype.maxbuffer = function(maxbuffer) {
	if (arguments.length !== 1) throw new Error('Prince#maxbuffer: invalid number of arguments');
	this.config.maxbuffer = maxbuffer;
	return this;
};

// set current working directory for CLI execution
Prince.prototype.cwd = function(cwd) {
	if (arguments.length !== 1) throw new Error('Prince#cwd: invalid number of arguments');
	this.config.cwd = cwd;
	return this;
};

// set input file(s)
Prince.prototype.inputs = function(inputs) {
	if (arguments.length !== 1) throw new Error('Prince#inputs: invalid number of arguments');
	this.config.inputs = Array.isArray(inputs) ? inputs : [inputs];
	return this;
};

// set cookie(s)
Prince.prototype.cookies = function(cookies) {
	if (arguments.length !== 1) throw new Error('Prince#cookies: invalid number of arguments');
	this.config.cookies = Array.isArray(cookies) ? cookies : [cookies];
	return this;
};

// set output file
Prince.prototype.output = function(output) {
	if (arguments.length !== 1) throw new Error('Prince#output: invalid number of arguments');
	this.config.output = output;
	return this;
};

// set CLI options
Prince.prototype.option = function(name, value, forced) {
	if (arguments.length < 1 || arguments.length > 3) throw new Error('Prince#option: invalid number of arguments');
	if (arguments.length < 2) value = true;
	if (arguments.length < 3) forced = false;
	if (!forced && typeof PRINCE_OPTIONS[name] === 'undefined') throw new Error('Prince#option: invalid prince(1) option: "' + name + '" (but can be forced)');
	if (!forced && PRINCE_OPTIONS[name] === true && arguments.length === 1) throw new Error('Prince#option: prince(1) option "' + name + '" required argument');
	this.config.option[name] = value;
	return this;
};

// execute the CLI binary
Prince.prototype._execute = function(args) {

	// return promise for executing CLI
	var self = this;
	return new Promise(function(resolve, reject) {

		var options = {
			timeout: self.config.timeout,
			maxBuffer: self.config.maxbuffer,
			cwd: self.config.cwd,
			encoding: 'buffer'
		};

		ChildProcess.execFile(BINARY, args, options, function(err, stdout, stderr) {
			if (err) {
				err.stdout = stdout;
				err.stderr = stderr;
				return reject(err);
			}

			var m = stderr.toString().match(/prince:\s+error:\s+([^\n]+)/);

			if (m) {
				err = new Error(m[1]);
				err.stdout = stdout;
				err.stderr = stderr;
				return reject(err);
			}

			resolve({stdout: stdout, stderr: stderr});
		});
	});
};

Prince.prototype._verifyInstalled = function() {

	// var self = this;

	return new Promise(function(resolve, reject) {

		Which(BINARY, function(err) {
			if (err) return reject(new Error(`Prince#_verifyInstalled: cannot find "${BINARY}" binary. Verify that "${BINARY}" is installed and is in the PATH.`));

			resolve();
		});
	});
};

// execute the CLI binary
Prince.prototype.execute = function() {
	// determine arguments to prince(1) binary
	var args = [];
	if (this.config.license !== '') {
		args.push('--license-file');
		args.push(this.config.license);
	}
	ForOwn(this.config.option, function(value, name) {
		args.push('--' + name);
		if (value !== true) args.push(value);
	});
	this.config.inputs.forEach(function(input) {
		args.push(input);
	});

	// supported since Prince 10
	this.config.cookies.forEach(function(cookie) {
		args.push('--cookie');
		args.push(cookie);
	});

	// required from Prince 11 on, supported since Prince 7
	args.push('--output');
	args.push(this.config.output);

	// return promise for executing CLI
	var self = this;
	return self._verifyInstalled()
		.then(function() {
			return self._execute(args);
		})
		.catch(function(err) {
			if (!err.stdout) err.stdout = '';
			if (!err.stderr) err.stderr = '';
			throw err;
		});
};

// export API constructor
module.exports = Prince;
