# PrinceXML

[Node](http://nodejs.org/) API for executing the XML/HTML to PDF renderer [PrinceXML](http://www.princexml.com/) via `prince` CLI.

# Overview

This is a [Node](http://nodejs.org/) API for executing the XML/HTML to PDF renderer [PrinceXML](http://www.princexml.com/) CLI `prince` from within JavaScript.

# Prerequisites

PrinceXML must already be [installed](https://www.princexml.com/download/), and the `prince` binary must be able to be run from the CLI.

To check whether the `prince` binary can be run, open up the CLI (Terminal/Powershell) and run:

```bash
prince --version
```

If the command did not execute successfully, verify that the `prince` binary can be found in the PATH. The `prince` binary is most likely under this directory:

- **Windows**: `C:\Program Files (x86)\Prince\engine\bin`
- **Linux/MacOS**: `/usr/local/bin`

# Install

```bash
npm install @ravdocs/princexml
```

# Methods

## Prince.exec()

Execute the `prince` command to convert XML/HTML to PDF. It is a wrapper around [`child_process.execFile`](https://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback).

- **inputs** `<string>` | `<string[]>` (*required*) Input file or files (XML/HTML). These can be either filepaths (local files) or urls (remote files).
- **output** `<string>` (*required*) Output file (PDF). Use the string `'-'` in order to output a stream instead of to a file.
- **options** `<Object>` Options to pass to the `prince` command. For a list of available options, look [here](https://www.princexml.com/doc-refs/) or run `prince --help` in the CLI.
- **execOptions** `<Object>` Options to pass to [`child_process.execFile`](https://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback).
- **callback** `<Function>`
	- **err** `<Error>`
	- **stdout** `<string>` | `<Buffer>`
	- **stderr** `<string>` | `<Buffer>`

Basic example:

```js
var Prince = require('@ravdocs/princexml');

Prince.exec('test.html', 'test.pdf', null, null, function(err, stdout, stderr) {
	if (stderr) console.log(stderr);
	if (err) throw err;

	console.log('Finished.');
});
```

More options:

```js
var Prince = require('@ravdocs/princexml');

var options = {
	'input': 'html',
	'structured-log': 'normal',
	'javascript': true,
	'pdf-profile': 'PDF/A-3b'
};
var execOptions = {
	timeout: 20 * 1000
};

Prince.exec('test.html', 'test.pdf', options, execOptions, function(err, stdout, stderr) {
	if (err) throw err;

	console.log('Finished.');
});
```

Sending the output in an HTTP response:

```js
var Prince = require('@ravdocs/princexml');
var Express = require('express');
var app = Express();

app.get('/', function(req, res) {

	Prince.exec('test.html', '-', null, null, function(err, stdout, stderr) {
		if (err) return res.status(500).send(stderr);

		res.contentType('application/pdf').send(stdout);
	});
});

app.listen(3000);
```

## Prince.version()

Returns version information about this NPM module and the PrinceXML software installed.

- **callback** `<Function>`
	- **err** `<Error>`
	- **info** `<string>`

Example:

```js
var Prince = require('@ravdocs/princexml');

Prince.version(function(err, info) {
	if (err) throw err;

	console.log(info);
});
```

Output:

```text
@ravdocs/princexml 1.5.4
Prince 12
Copyright 2002-2018 YesLogic Pty. Ltd.
Non-commercial License
```
