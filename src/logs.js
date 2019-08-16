'use strict';

var Prove = require('provejs-params');

function parseLine(line) {

	Prove('SNA', arguments);

	var parts = line.split('|');

	switch (parts[0]) {
		case 'sta': return toLogStatus(parts);
		case 'msg': return toLogMessage(parts);
		case 'prg': return toLogProgress(parts);
		case 'dat': return toLogData(parts);
		case 'fin': return toLogFinal(parts);
		default: return null;
	}
}

// 'sta|...' is a status message.
function toLogStatus(parts) {

	Prove('A', arguments);

	return {
		type: 'info',
		source: 'engine/pdf',
		name: 'status',
		value: parts[1],
		created: new Date().toISOString()
	};
}

// 'msg|...|...' is a message.
// It is one of the following:
// - 'msg|err|...': error message
// - 'msg|wrn|...': warning message
// - 'msg|inf|...': information message
// - 'msg|dbg|...': debug message
// - 'msg|out|...': console output from `console.log()`
// Note: Currently (Prince 12), 'msg|err|...', 'msg|wrn|...', 'msg|inf|...',
// and 'msg|dbg|...' are formatted incorrectly as 'msg|...||...'.
function toLogMessage(parts) {

	Prove('A', arguments);

	var type = getMessageType(parts[1]);
	var name = getMessageName(parts[1]);
	var value = getValue(parts, 2);
	var vparts = value.split('|');

	var isLoadDoc = /^loading document: /.test(value);
	var isLoadLic = /^loading license: /.test(value);

	// cleanup
	if (isLoadDoc) {
		name = 'Loading Document';
		value = value.replace('loading document: ', '');
	} else if (isLoadLic) {
		name = 'Loading License';
		value = value.replace('loading license: ', '');
	} else if (vparts.length === 2) {
		name = vparts[1];
		value = vparts[0];
	}

	return {
		type: type,
		source: 'engine/pdf',
		name: name,
		value: value,
		created: new Date().toISOString()
	};
}

function getMessageType(abbr) {

	Prove('S', arguments);

	switch (abbr) {
		case 'err': return 'error';
		case 'wrn': return 'warn';
		case 'inf': return 'info';
		case 'dbg': return 'info';
		case 'out': return 'info';
	}
}

function getMessageName(abbr) {

	Prove('S', arguments);

	switch (abbr) {
		case 'err': return 'error';
		case 'wrn': return 'warning';
		case 'inf': return 'info';
		case 'dbg': return 'debug';
		case 'out': return 'output';
	}
}

// The parts are a line split by '|'.
// Usually, the value will be the last part.
// However, the value may have had one or more '|' in it, and, if so, the
// value will have been split into multiple parts. In this case, they must
// be rejoined by '|'.
function getValue(parts, i) {
	Prove('AN', arguments);
	return parts.slice(i).join('|');
}

// 'prg|...' is a progress percentage.
// It is in the format 'prg|{{percent}}', where '{{percent}}' is 0, 100, or any
// number in between.
function toLogProgress(parts) {

	Prove('A', arguments);

	return {
		type: 'info',
		source: 'engine/pdf',
		name: 'progress-percent',
		value: parts[1],
		created: new Date().toISOString()
	};
}

// 'dat|name|value' is a data message produced by `Log.data("name", "value")`.
function toLogData(parts) {

	Prove('A', arguments);

	var value = getValue(parts, 2);
	var parsed;

	// parse data if posssible
	try {
		parsed = JSON.parse(value);
		value = parsed;
	} catch (e) {
		// do nothing
	}

	return {
		type: 'data',
		source: 'engine/pdf',
		name: parts[1],
		value: value,
		created: new Date().toISOString()
	};
}

// 'fin|...' is the final outcome.
// It is one of the following:
// - 'fin|success'
// - 'fin|failure'
function toLogFinal(parts) {

	Prove('A', arguments);

	return {
		type: 'info',
		source: 'engine/pdf',
		name: 'document',
		value: parts[1],
		created: new Date().toISOString()
	};
}

// remove any null logs, i.e., lines which were not parsable
function compact(arr) {
	Prove('A', arguments);
	return arr.filter(function(val) {
		return (!!val);
	});
}


function bugWorkaround(stderr) {
	// workaround for current bug where message is 'msg|...||...' instead of 'msg|...|...'
	stderr = stderr.replace(/^msg\|((err)|(wrn)|(inf)|(dbg))\|\|/mg, 'msg|$1|');
	return stderr;
}

module.exports = function(stderr) {

	Prove('*', arguments);

	var lines, logs;

	if (Buffer.isBuffer(stderr)) stderr = stderr.toString();
	if (typeof stderr !== 'string') return [];

	stderr = bugWorkaround(stderr);
	lines = stderr.split(/\r?\n/);
	logs = lines.map(parseLine);
	logs = compact(logs);

	return logs;
};
