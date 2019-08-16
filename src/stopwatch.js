'use strict';

function parseHrtimeToSeconds(hrtime) {
	var seconds = (hrtime[0] + (hrtime[1] / 1e9));
	return seconds;
}

/* usage:
var stopwatch = new Utils.stopwatch().start();
var duration = stopwatch.stop();
*/
module.exports = function() {

	var _duration;
	var _start = process.hrtime();

	function stop(unformatted) {
		var elapsed = process.hrtime(_start);
		_duration = parseHrtimeToSeconds(elapsed);
		return (unformatted)? _duration : _duration.toFixed(3) + ' secs';
	}

	return {
		stop: stop
	};
};
