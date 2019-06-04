'use strict';

var Prove = require('provejs-params');

module.exports = function(stderr) {

	Prove('*', arguments);

	if (Buffer.isBuffer(stderr)) stderr = stderr.toString();
	if (typeof stderr !== 'string') return [];

	stderr = stderr.replace(/^msg\|((err)|(wrn)|(inf)|(dbg))\|\|/mg, 'msg|$1|'); // workaround for current bug where message is 'msg|...||...' instead of 'msg|...|...'
	var lines = stderr.split(/\r?\n/);
	var logs = lines.map(exports._newLog);
	logs = exports._compact(logs); // remove any null logs, i.e., lines which were not parsable

	return logs;
};

exports._newLog = function(line) {

	Prove('SNA', arguments);

	var parts = line.split('|');

	switch (parts[0]) {
		case 'sta': return exports._newLogStatus(parts);
		case 'msg': return exports._newLogMessage(parts);
		case 'prg': return exports._newLogProgress(parts);
		case 'dat': return exports._newLogData(parts);
		case 'fin': return exports._newLogFinal(parts);
		default: return null;
	}
};

// 'sta|...' is a status message.
exports._newLogStatus = function(parts) {

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
exports._newLogMessage = function(parts) {

	Prove('A', arguments);

	return {
		type: 'message',
		name: exports._messageName(parts[1]),
		value: exports._value(parts, 2)
	};
};

exports._messageName = function(abbr) {

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
exports._value = function(parts, i) {

	Prove('AN', arguments);

	return parts.slice(i).join('|');
};

// 'prg|...' is a progress percentage.
// It is in the format 'prg|{{percent}}', where '{{percent}}' is 0, 100, or any
// number in between.
exports._newLogProgress = function(parts) {

	Prove('A', arguments);

	return {
		type: 'progress',
		name: 'percent',
		value: parts[1]
	};
};

// 'dat|name|value' is a data message produced by `Log.data("name", "value")`.
exports._newLogData = function(parts) {

	Prove('A', arguments);

	return {
		type: 'data',
		name: parts[1],
		value: exports._value(parts, 2)
	};
};

// 'fin|...' is the final outcome.
// It is one of the following:
// - 'fin|success'
// - 'fin|failure'
exports._newLogFinal = function(parts) {

	Prove('A', arguments);

	return {
		type: 'final',
		name: 'outcome',
		value: parts[1]
	};
};

exports._compact = function(arr) {

	Prove('A', arguments);

	return arr.filter(function(val) {
		return (!!val);
	});
};