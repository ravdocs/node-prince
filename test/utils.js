/* eslint-env mocha */
'use strict';

require('colors');
var Prove = require('provejs-params');
var Assert = require('assert');
var KindOf = require('kind-of');
var _ = {};
_.IsEmpty = require('lodash.isempty');

exports.log = function(arg1, arg2) {

	// Prove('**', arguments);

	var indent = ' ';

	if (typeof arg1 === 'string' && arg1[0] === '*') {

		if (typeof arg2 !== 'string') arg2 = JSON.stringify(arg2);

		if (arg1) arg1 = indent + arg1.gray;
		if (arg2) arg2 = indent + arg2.gray;
	}

	if (arguments.length === 2) {
		console.log(arg1, arg2);
	} else {
		console.log(arg1);
	}
};

exports.is = function(got, expected, label) {
	Prove('**S', arguments);
	Assert.ok((got === expected), `Expected '${label}' to be '${expected}' but got '${got}'.`);
};

// exports.isNot = function(got, unexpected, label) {
// 	Prove('**S', arguments);
// 	Assert.ok((got !== unexpected), `Expected '${label}' not to be '${unexpected}' but got '${got}'.`);
// };

exports.isGreaterThan = function(got, expected, label) {
	Prove('**S', arguments);
	Assert.ok((got > expected), `Expected '${label}' to be greater than '${expected}' but got '${got}'.`);
};

// exports.isAtLeast = function(got, criterion, label) {
// 	Prove('**S', arguments);
// 	Assert.ok((got >= criterion), `Expected '${label}' to be at least '${criterion}' but got '${got}'.`);
// };

// exports.isAtMost = function(got, criterion, label) {
// 	Prove('**S', arguments);
// 	Assert.ok((got <= criterion), `Expected '${label}' to be at most '${criterion}' but got '${got}'.`);
// };

// exports.isLessThan = function(got, criterion, label) {
// 	Prove('**S', arguments);
// 	Assert.ok((got < criterion), `Expected '${label}' to be less than '${criterion}' but got '${got}'.`);
// };

exports.isArray = function(val, label) {
	Prove('*S', arguments);
	exports._isKind(val, 'array', label);
};

// exports.isBool = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKind(val, 'boolean', label);
// };

exports.isBuffer = function(val, label) {
	Prove('*S', arguments);
	exports._isKind(val, 'buffer', label);
};

// exports.isDate = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKind(val, 'date', label);
// };

// exports.isError = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKind(val, 'error', label);
// };

exports.isNumber = function(val, label) {
	Prove('*S', arguments);
	exports._isKind(val, 'number', label);
};

// exports.isNull = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKind(val, 'null', label);
// };

exports.isObject = function(val, label) {
	Prove('*S', arguments);
	exports._isKind(val, 'object', label);
};

exports.isString = function(val, label) {
	Prove('*S', arguments);
	exports._isKind(val, 'string', label);
};

exports._isKind = function(val, expected, label) {
	Prove('**S', arguments);
	var got = KindOf(val);
	Assert.ok((got === expected), `Expected kind of '${label}' to be '${expected}' but got '${got}'.`);
};

// exports.isDateOrNull = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKindOrNull(val, 'date', label);
// };

// exports.isNumberOrNull = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKindOrNull(val, 'number', label);
// };

// exports.isStringOrNull = function(val, label) {
// 	Prove('*S', arguments);
// 	exports._isKindOrNull(val, 'string', label);
// };

// exports._isKindOrNull = function(val, expected, label) {
// 	Prove('**S', arguments);
// 	var got = KindOf(val);
// 	Assert.ok((got === expected || got === null), `Expected kind of '${label}' to be '${expected}' or 'null' but got '${got}'.`);
// };

// exports.isEmpty = function(val, label) {
// 	Prove('*S', arguments);
// 	Assert.ok(_.IsEmpty(val), `Expected '${label}' to be empty but it is not.`);
// };

exports.isNotEmpty = function(val, label) {
	Prove('*S', arguments);
	Assert.ok(!_.IsEmpty(val), `Expected '${label}' not to be empty but it is.`);
};
