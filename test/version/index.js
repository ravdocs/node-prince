/* eslint-env mocha */
'use strict';

var Assert = require('@ravdocs/assert');
var Prince = require('../..');
var Pkg = require('../../package.json');

describe('Prince.version()', function() {

	it('should return version', function(done) {

		Prince.version(function (err, actual) {
			if (err) throw err;
			var expected = `${Pkg.name} ${Pkg.version} (Prince 12.5)`;
			Assert.strictEqual('version', actual, expected);
			done();
		});
	});
});
