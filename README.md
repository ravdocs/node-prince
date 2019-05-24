
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

# Usage

```js
var Prince = require('@ravdocs/princexml');
var util = require('utils');

Prince()
	.inputs("test.html")
	.output("test.pdf")
	.execute()
	.then(function () {
		console.log("OK: done");
	}, function (error) {
		console.log("ERROR: ", util.inspect(error));
	})
```

# API

- `Prince([options]): Prince`: constructor for the API. Call this once
  for every XML/HTML to PDF conversion process.
  This returns the Prince API for further method chaining.

- `Prince#binary(binary): Prince`: set the path to the prince(1) binary.
  By default it is `prince` (in case PrinceXML was found globally
  installed at the Node API installation time) or the path to the
  `prince` binary of the locally installed PrinceXML distribution (in
  case PrinceXML was not found globally installed at the Node API
  installation time).
  This returns the Prince API for further method chaining.

- `Prince#prefix(prefix): Prince`: set the path to the PrinceXML
  installation. This by default is either empty
  (in case PrinceXML was found globally
  installed at the Node API installation time) or the path to the
  locally installed PrinceXML distribution (in case PrinceXML was not
  found globally installed at the Node API installation time).
  This returns the Prince API for further method chaining.

- `Prince#license(filename): Prince`: set the path to the PrinceXML
  license file. This by default uses the path `license/license.dat`
  under the PrinceXML installation.
  This returns the Prince API for further method chaining.

- `Prince#timeout(timeout): Prince`: set the execution timeout in milliseconds.
  The by default it is `10000` (10s).
  This returns the Prince API for further method chaining.

- `Prince#maxbuffer(maxbuffer): Prince`: set the execution maximum stdout/stderr buffer size in bytes.
  The by default it is `10485760` (10MB).
  This returns the Prince API for further method chaining.

- `Prince#cwd(dirname): Prince`: set the current working directory for execution.
  The by default it is `.` (current working directory).
  This returns the Prince API for further method chaining.

- `Prince#inputs(filename): Prince`: set one (in case `filename` is a string)
   or multiple (in case `filename` is an array of strings) input XML/HTML files.
  This returns the Prince API for further method chaining.

- `Prince#output(filename): Prince`: set the output PDF file.
  This returns the Prince API for further method chaining.

- `Prince#option(name, value[, forced]): Prince`: set a PrinceXML option
  name `name` to a value `value`. The API knows the officially supported
  options of PrinceXML 9.0 and by default rejects unknown options.
  But arbitrary options can be passed by setting `forced` to `true`
  in case a different PrinceXML version should be used. This returns
  the Prince API for further method chaining.

- `Prince#execute(): Promise`: asynchronously execute the conversion
  process. This returns a promise. On success it resolves to
  an object with `stdout` and `stderr` fields. On error, it
  resolves to an object with `error`, ` stdout` and `stderr` fields.

# License

- Copyright (c) 2014-2018 Ralf S. Engelschall (http://engelschall.com/)
- Copyright (c) 2018 RAVdocs (http://ravdocs.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
