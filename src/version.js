'use strict';

var Prove = require('provejs-params');
var OS = require('os');
var Pkg = require('../package.json');
var Exec = require('./exec');

module.exports = function(next) {

	Prove('F', arguments);

	var princeOptions = {
		version: true
	};

	Exec(null, null, princeOptions, null, function(err, stdout) {
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
