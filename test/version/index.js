/* eslint-env mocha */
'use strict';

var Assert = require('@ravdocs/assert');
var Prince = require('../..');
var Pkg = require('../../package.json');

describe('Prince.version()', function() {

	it('should return package version and may include prince version immediately', function(done) {
		var actual = Prince.version();
		var expected = `${Pkg.name} ${Pkg.version}`;
		var startsWith = actual.indexOf(expected) === 0;
		Assert.strictEqual('version', startsWith, true);
		done();
	});

	it('should return package version with prince version shortly later', function(done) {

		setTimeout(function() {
			var actual = Prince.version();
			var expected = `${Pkg.name} ${Pkg.version} (Prince 12.5)`;
			Assert.deepStrictEqual('version', actual, expected);
			done();
		}, 100);
	});
});
