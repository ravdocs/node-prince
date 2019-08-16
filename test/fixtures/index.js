'use strict';

var fs = require('fs');

function toParagraphs(num) {
	var html = '';
	for (var i = 0; i < num; i++) {
		html += '<p>This is a paragraph</p>';
	}
	return html;
}

function toPages(num) {
	var html = '';
	for (var i = 0; i < num; i++) {
		html += toParagraphs(30);
	}
	return html;
}

exports.toHtml = function (options) {
	var path = '/tmp/test.html';
	options.pages = options.pages || 1;
	var lines = [], html;
	lines.push('<!DOCTYPE html>');
	lines.push('<html>');
	lines.push('<head>');
	lines.push('<meta charset="utf-8"/>');
	lines.push('<title>Test</title>');
	lines.push('</head>');
	lines.push('<body>');
	lines.push(toPages(options.pages));
	lines.push('</body>');
	lines.push('</html>');
	html = lines.join('\n');

	fs.writeFileSync(path, html);
	return path;
};
