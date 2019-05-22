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
var FS = require('fs');
var Path = require('path');
var Promise = require('promise');
var ForOwn = require('lodash.forown');

// the officially support options of prince(1)
var PRINCE_OPTIONS = {
	'help': false,
	'version': false,
	'credits': false,
	'verbose': false,
	'log': true,
	'input': true,
	'input-list': true,
	'baseurl': true,
	'fileroot': true,
	'no-xinclude': false,
	'no-network': false,
	'http-user': true,
	'http-password': true,
	'http-proxy': true,
	'http-timeout': true,
	'cookiejar': true,
	'ssl-cacert': true,
	'ssl-capath': true,
	'insecure': false,
	'javascript': false,
	'script': true,
	'style': true,
	'media': true,
	'no-author-style': false,
	'no-default-style': false,
	'output': true,
	'profile': true,
	'attach': true,
	'no-embed-fonts': false,
	'no-subset-fonts': false,
	'no-compress': false,
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
	'scanfonts': false
};

// API constructor
function Prince (options) {
	// optionally on-the-fly generate an instance
	if (!(this instanceof Prince)) return new Prince(options);

	// create default configuration
	this.config = {
		binary: 'prince',
		prefix: '',
		license: '',
		timeout: 10 * 1000,
		maxbuffer: 10 * 1024 * 1024,
		cwd: '.',
		option: {},
		inputs: [],
		cookies: [],
		output: ''
	};

	// allow caller to override defaults
	if (typeof options === 'object') {
		if (typeof options.binary !== 'undefined') this.binary(options.binary);
		if (typeof options.prefix !== 'undefined') this.prefix(options.prefix);
		if (typeof options.inputs !== 'undefined') this.inputs(options.inputs);
		if (typeof options.cookies !== 'undefined') this.cookies(options.cookies);
		if (typeof options.output !== 'undefined') this.output(options.output);
	}

	return this;
}

// set path to CLI binary
Prince.prototype.binary = function (binary) {
	if (arguments.length !== 1) throw new Error('Prince#binary: invalid number of arguments');
	this.config.binary = binary;
	this.config.prefix = '';

	return this;
};

// set path to installation tree
Prince.prototype.prefix = function (prefix) {
	if (arguments.length !== 1) throw new Error('Prince#prefix: invalid number of arguments');
	this.config.prefix = prefix;
	return this;
};

// set path to license file
Prince.prototype.license = function (filename) {
	if (arguments.length !== 1) throw new Error('Prince#license: invalid number of arguments');
	this.config.license = filename;
	return this;
};

// set timeout for CLI execution
Prince.prototype.timeout = function (timeout) {
	if (arguments.length !== 1) throw new Error('Prince#timeout: invalid number of arguments');
	this.config.timeout = timeout;
	return this;
};

// set maxmimum stdout/stderr buffer for CLI execution
Prince.prototype.maxbuffer = function (maxbuffer) {
	if (arguments.length !== 1) throw new Error('Prince#maxbuffer: invalid number of arguments');
	this.config.maxbuffer = maxbuffer;
	return this;
};

// set current working directory for CLI execution
Prince.prototype.cwd = function (cwd) {
	if (arguments.length !== 1) throw new Error('Prince#cwd: invalid number of arguments');
	this.config.cwd = cwd;
	return this;
};

// set input file(s)
Prince.prototype.inputs = function (inputs) {
	if (arguments.length !== 1) throw new Error('Prince#inputs: invalid number of arguments');
	this.config.inputs = Array.isArray(inputs) ? inputs : [inputs];
	return this;
};

// set cookie(s)
Prince.prototype.cookies = function (cookies) {
	if (arguments.length !== 1) throw new Error('Prince#cookies: invalid number of arguments');
	this.config.cookies = Array.isArray(cookies) ? cookies : [cookies];
	return this;
};

// set output file
Prince.prototype.output = function (output) {
	if (arguments.length !== 1) throw new Error('Prince#output: invalid number of arguments');
	this.config.output = output;
	return this;
};

// set CLI options
Prince.prototype.option = function (name, value, forced) {
	if (arguments.length < 1 || arguments.length > 3) throw new Error('Prince#option: invalid number of arguments');
	if (arguments.length < 2) value = true;
	if (arguments.length < 3) forced = false;
	if (!forced && typeof PRINCE_OPTIONS[name] === 'undefined') throw new Error('Prince#option: invalid prince(1) option: "' + name + '" (but can be forced)');
	if (!forced && PRINCE_OPTIONS[name] === true && arguments.length === 1) throw new Error('Prince#option: prince(1) option "' + name + '" required argument');
	this.config.option[name] = value;
	return this;
};

// execute the CLI binary
Prince.prototype._execute = function (method, args) {
	// determine path to prince(1) binary
	var prog = this.config.binary;
	if (!FS.existsSync(prog)) {
		var findInPath = function (name) {
			var p = process.env.PATH.split(Path.delimiter).map(function(item) {
				return Path.join(item, name);
			});
			for (var i = 0, len = p.length; i < len; i++) if (FS.existsSync(p[i])) return p[i];
			return undefined;
		};
		prog = findInPath(prog);
		if (typeof prog === 'undefined') throw new Error('Prince#' + method + ': cannot resolve binary "' +
                this.config.binary + '" to a filesystem path');
	}

	// return promise for executing CLI
	var self = this;
	return new Promise(function (resolve, reject) {
		try {
			var options = {};
			options.timeout = self.config.timeout;
			options.maxBuffer = self.config.maxbuffer;
			options.cwd = self.config.cwd;
			options.encoding = 'buffer';
			ChildProcess.execFile(prog, args, options,
				function (err, stdout, stderr) {
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
		} catch (err) {
			err.stdout = '';
			err.stderr = '';
			reject(err);
		}
	});
};

// execute the CLI binary
Prince.prototype.execute = function () {
	// determine arguments to prince(1) binary
	var args = [];
	if (this.config.prefix !== '') {
		args.push('--prefix');
		args.push(this.config.prefix);
	}
	if (this.config.license !== '') {
		args.push('--license-file');
		args.push(this.config.license);
	}
	ForOwn(this.config.option, function (value, name) {
		args.push('--' + name);
		if (value !== true) args.push(value);
	});
	this.config.inputs.forEach(function (input) {
		args.push(input);
	});

	// supported since Prince 10
	this.config.cookies.forEach(function (cookie) {
		args.push('--cookie');
		args.push(cookie);
	});

	// required from Prince 11 on, supported since Prince 7
	args.push('--output');
	args.push(this.config.output);

	// return promise for executing CLI
	return this._execute('execute', args);
};

// export API constructor
module.exports = Prince;
