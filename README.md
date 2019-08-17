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
- **output** `<string>` (*required*) Output file (PDF). Use the string `'-'` in order to output a buffer instead of to a file.
- **options** `<Object>` Options to pass to the `prince` command. For a list of available options, look [here](https://www.princexml.com/doc-refs/) or run `prince --help` in the CLI.
- **callback** `<Function>`
	- **err** `<Error>`
	- **pdf** ``<Buffer>`
	- **logs** `<array>` Array of log data, parsed from stderr using option [`structured-log`](https://www.princexml.com/doc-prince/#structured-log).
	- **meta** `<Object>`
		- **cmd** `<string>` Command executed, including args.
		- **duration** `<number>` Execution duration, in seconds, of the `prince` command.
		- **output** `<string>` Stderr output which is the same data as logs before being parsed.

Basic example:

```js
var Prince = require('@ravdocs/princexml');
var options = {'javascript': true};

Prince.exec('test.html', 'test.pdf', options, function(err, pdf, logs, meta) {
	if (err) throw err;

	Assert.equal(Buffer.isBuffer(pdf), true);
	Assert.equal(typeof logs, 'array');

	console.log('meta.cmd:', meta.cmd);
	console.log('meta.duration:', meta.duration);
	console.log('meta.output', meta.output);

	console.log('Finished.');
});
```
Sending the output in an HTTP response:

```js
var Prince = require('@ravdocs/princexml');
var Express = require('express');
var app = Express();

app.get('/', function(req, res) {

	Prince.exec('test.html', '-', null, function(err, pdf, logs, meta) {
		if (err) return res.status(500).json(logs);

		console.log('meta.cmd:', meta.cmd);
		console.log('meta.duration:', meta.duration);
		console.log('meta.output:', meta.output);

		res.type('pdf').send(pdf);
	});
});

app.listen(3000);
```

## Prince.version()

Returns version information about this NPM module and the PrinceXML software installed.

```js
var Prince = require('@ravdocs/princexml');

Prince.version(function(err, version) {
	if (err) throw err;
	console.log(version); // `@ravdocs/princxml x.y.z (Prince 12.5)`
});
```

## Prince.logs()

Extracts any [structured logs](https://www.princexml.com/doc-prince/#structured-log) from the stderr outputted by [`Prince.exec()`](#princeexec), parses them, and returns them in object format.

- **stderr** `<string>` | `<Buffer>` (*required*) The stderr returned from [`Prince.exec()`](#princeexec).
- Returns: **logs** `<Object[]>`
	- **type** `<string>` The type or classification of the log. It can be 'status', 'message', 'progress', 'data', or 'final'.
	- **name** `<string>` The name or label of the log.
	- **value** `<string>` The descriptive content of the log.

Parsing:

- When the `type` of a `log` is 'status', its `name` is ''.
- When the `type` of a `log` is 'message', its `name` is 'error', 'warning', 'info', 'debug', or 'output'.
- When the `type` of a `log` is 'progress', its `name` is 'percent'.
- When the `type` of a `log` is 'data', its `name` and `value` are the arguments passed to [`Log.data('name', 'value')`](https://www.princexml.com/doc-prince/#js-logging).
- When the `type` of a `log` is 'final', its `name` is 'outcome', and its `value` is either 'success' or 'failure'.

Note that the [`structured-log`](https://www.princexml.com/doc-prince/#structured-log) option must have been passed to [`Prince.exec()`](#princeexec) in order for this method to be able to extract any logs from the stderr.


## Prince Options

For reference only, below are the prince options.

```js
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
```