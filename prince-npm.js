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

/* global process: false */
/* global __dirname: false */
/* global require: false */
/* global console: false */
/* eslint no-console: 0 */

/*
 *  prince-npm.js: NPM install-time integration
 */
'use strict';

/*  core requirements  */
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

/*  extra requirements  */
var Progress = require('progress');
var Promise = require('promise');
var request = require('request');
var which = require('which');
var chalk = require('chalk');
var tar = require('tar');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

/*  determine path and version of prince(1)  */
var princeInfo = function () {
	return new Promise(function (resolve, reject) {
		which('prince', function (err, filename) {
			if (err) err.message = 'prince(1) not found in PATH: ' + err.message;
			if (err) return reject(err);

			child_process.execFile(filename, ['--version'], function (err, stdout, stderr) {
				if (err) err.message = 'prince(1) failed on "--version": ' + err.message;
				if (err) return reject(err);

				var m = stdout.match(/^Prince\s+(\d+(?:\.\d+)?)/);
				if (!(m !== null && typeof m[1] !== 'undefined')) {
					reject(new Error('prince(1) returned unexpected output on "--version":\n' + stdout + stderr));
					return;
				}
				resolve({command: filename, version: m[1]});
			});
		});
	});
};

/*  return download URL for latest PrinceXML distribution  */
var princeDownloadURL = function () {
	return new Promise(function (resolve, reject) {
		var id = process.arch + '-' + process.platform;
		if (id.match(/^ia32-win32$/)) resolve('https://www.princexml.com/download/prince-12-win32-setup.exe');
		else if (id.match(/^x64-win32$/)) resolve('https://www.princexml.com/download/prince-12-win64-setup.exe');
		else if (id.match(/^(?:ia32|x64)-darwin/)) resolve('https://www.princexml.com/download/prince-12-macosx.tar.gz');
		else {

			// todo: move away from `shtool` to https://nodejs.org/api/os.html
			child_process.exec('sh "' + __dirname + '/shtool" platform -t binary', function (err, stdout /*, stderr */) {
				if (err) err.message = 'ERROR: failed to determine platform details on platform "' + id + '": ' + err.message;
				if (err) return reject(err);
				console.log('princexml stdout:', stdout);// dev
				var platform = stdout.toString().replace(/^(\S+).*\n?$/, '$1');
				console.log('princexml platform:', platform);// dev
				if (id.match(/^(?:ia32|x64)-linux/)) {
					if (platform.match(/^ix86-ubuntu1[45](?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-12-ubuntu14.04-i386.tar.gz');
					else if (platform.match(/^amd64-ubuntu1[45](?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-12-ubuntu14.04-amd64.tar.gz');
					else if (platform.match(/^ix86-ubuntu1[67](?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-12-ubuntu16.04-i386.tar.gz');
					else if (platform.match(/^amd64-ubuntu1[67](?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-12-ubuntu12.04-i386.tar.gz');

					// todo: support latest ubuntu builds

					else if (platform.match(/^amd64-debian8(?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-11.3-debian8.0-amd64.tar.gz');
					else if (platform.match(/^amd64-debian7(?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-11.3-debian7.4-amd64.tar.gz');


					else if (platform.match(/^amd64-centos7(?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-12-centos7-x86_64.tar.gz');
					else if (platform.match(/^amd64-centos6(?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-12-centos6-x86_64.tar.gz');
					else if (platform.match(/^ix86-centos6(?:\.\d+)*$/)) resolve('https://www.princexml.com/download/prince-11.3-centos6-i386.tar.gz');


					else if (id.match(/^ia32-/)) resolve('https://www.princexml.com/download/prince-12-linux-generic-i686.tar.gz');
					else if (id.match(/^x64-/)) resolve('https://www.princexml.com/download/prince-12-linux-generic-x86_64.tar.gz');
				} else if (id.match(/^ia32-freebsd/)) resolve('https://www.princexml.com/download/prince-10r7-freebsd10.1-i386-static.tar.gz');
				else if (id.match(/^x64-freebsd/)) resolve('https://www.princexml.com/download/prince-11.3-freebsd11.0-amd64.tar.gz');
				else if (id.match(/^(?:ia32|x64)-sunos/)) resolve('https://www.princexml.com/download/prince-10r7-sol11x86.tar.gz');
				else {
					reject(new Error('ERROR: PrinceXML not available for platform "' + platform + '"'));
				}
			});
		}
	});
};

/*  download data from URL  */
var downloadData = function (url) {
	return new Promise(function (resolve, reject) {
		var options = {
			method: 'GET',
			url: url,
			encoding: null,
			headers: {
				'User-Agent': 'node-prince (prince-npm.js:install)'
			}
		};
		(new Promise(function (resolve /*, reject  */) {
			if (typeof process.env.http_proxy === 'string' && process.env.http_proxy !== '') {
				options.proxy = process.env.http_proxy;
				console.log('-- using proxy ($http_proxy): ' + options.proxy);
				resolve();
			} else {
				child_process.exec('npm config get proxy', function (err, stdout /*, stderr */) {
					if (err === null) {
						stdout = stdout.toString().replace(/\r?\n$/, '');
						if (stdout.match(/^https?:\/\/.+/)) {
							options.proxy = stdout;
							console.log('-- using proxy (npm config get proxy): ' + options.proxy);
						}
					}
					resolve();
				});
			}
		})).then(function () {
			console.log('-- download: ' + url);
			var req = request(options, function (err, response, body) {
				if (err) err.message = 'download failed: ' + err.message;
				if (err) return reject(err);
				if (response.statusCode !== 200) return reject(new Error('download failed with status: ' + response.statusCode));

				console.log('-- download: ' + body.length + ' bytes received.');
				resolve(body);
			});
			var progress_bar = null;
			req.on('response', function (response) {
				var len = parseInt(response.headers['content-length'], 10);
				progress_bar = new Progress(
					'-- download: [:bar] :percent (ETA: :etas)', {
						complete: '#',
						incomplete: '=',
						width: 40,
						total: len
					}
				);
			});
			req.on('data', function (data) {
				if (progress_bar !== null) progress_bar.tick(data.length);
			});
		});
	});
};

/*  extract a tarball (*.tar.gz)  */
var extractTarball = function (tarball, destdir, stripdirs) {
	return new Promise(function (resolve, reject) {
		fs.createReadStream(tarball)
			.pipe(zlib.createGunzip())
			.pipe(tar.extract({cwd: destdir, strip: stripdirs}))
			.on('error', function (err) {
				reject(err);
			})
			.on('close', function () {
				console.log('Extracted tarball'); // dev
				/* global setTimeout: true */
				setTimeout(function () {
					resolve();
				}, 500);
			});
	});
};

/*  main procedure  */
if (process.argv.length !== 3) {
	console.log(chalk.red('ERROR: invalid number of arguments'));
	process.exit(1); // eslint-disable-line no-process-exit
}
var destdir;
if (process.argv[2] === 'install') {
	/*  installation procedure  */
	console.log('++ checking for globally installed PrinceXML');
	princeInfo().then(function (prince) {
		console.log('-- found prince(1) command: ' + chalk.blue(prince.command));
		console.log('-- found prince(1) version: ' + chalk.blue(prince.version));
	}, function (/* err */) {
		console.log('++ no globally installed PrinceXML found');
		console.log('++ downloading PrinceXML distribution');
		princeDownloadURL().then(function (url) {
			downloadData(url).then(function (data) {
				destdir = path.join(__dirname, 'prince');
				console.log('++ locally unpacking PrinceXML distribution to ' + destdir);
				var destfile;
				if (process.platform === 'win32') {
					destfile = path.join(__dirname, 'prince.exe');
					fs.writeFileSync(destfile, data, {encoding: null});
					var args = ['/s', '/a', '/vTARGETDIR="' + path.resolve(destdir) + '" /qn'];
					child_process.execFile(destfile, args, function (err, stdout, stderr) {
						if (err !== null) {
							console.log(chalk.red('** ERROR: failed to extract: ' + err));
							stdout = stdout.toString();
							stderr = stderr.toString();
							if (stdout !== '') console.log('** STDOUT: ' + stdout);
							if (stderr !== '') console.log('** STDERR: ' + stderr);
						} else {
							fs.unlinkSync(destfile);
							console.log('-- OK: local PrinceXML installation now available');
						}
					});
				} else {
					destfile = path.join(__dirname, 'prince.tgz');
					fs.writeFileSync(destfile, data, {encoding: null});
					mkdirp.sync(destdir);
					extractTarball(destfile, destdir, 1).then(function () {
						fs.unlinkSync(destfile);
						console.log('-- OK: local PrinceXML installation now available');
					}, function (err) {
						console.log(chalk.red('** ERROR: failed to extract: ' + err));
					});
				}
			}, function (err) {
				console.log(chalk.red('** ERROR: failed to download: ' + err));
				process.exit(1); // eslint-disable-line no-process-exit
			});
		}, function(err) {
			console.log(chalk.red('** ERROR: failed to find download url: ' + err));
			process.exit(1); // eslint-disable-line no-process-exit
		});
	});
} else if (process.argv[2] === 'uninstall') {
	/*  uninstallation procedure  */
	destdir = path.join(__dirname, 'prince');
	if (fs.existsSync(destdir)) {
		console.log('++ deleting locally unpacked PrinceXML distribution');
		rimraf(destdir, function (err) {
			if (err !== null) console.log(chalk.red('** ERROR: ' + err));
			else console.log('-- OK: done');
		});
	}
} else {
	console.log(chalk.red('ERROR: invalid argument'));
	process.exit(1); // eslint-disable-line no-process-exit
}
