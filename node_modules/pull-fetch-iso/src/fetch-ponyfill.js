'use strict';

var request = require('request');

var Promise = require('./promise-standin');

fetch.isPony = true;

module.exports = fetch;

function fetch( url, opts ){
	var promise = new Promise();
	var buffer = [];
	var buffering = false;
	var done = false;
	var json = false;
	var promiseBody;
	var error;
	var cb;
	var waiter;

	var classic = request(url, {
		method: opts.method,
		headers: opts.headers,
		body: opts.body,
		gzip: true,
	})
		.on('response', onResponse)
		.on('end', onEnd)
		.on('close', onEnd)
		.on('error', onError)
		.on('data', onData);

	return promise;

	function onResponse( response ){
		classic.pause();

		var code = response.statusCode;

		promise.settle({
			status: code,
			statusText: response.statusMessage,
			ok: code >= 200 && code < 300,
			text: drain,
			json: function(){
				json = true;
				return drain();
			},
			headers: {
				get: function( key ){
					return response.headers[key];
				},
			},
			source: source,
		});
	}

	function source( abort, cb ){
		if (abort)
			return end(abort, cb);

		if (error)
			return end(error, cb);

		if (buffer.length > 0)
			return cb(null, buffer.shift());

		if (done)
			return end(true, cb);

		waiter = cb;

		if (classic)
			return classic.resume();
	}

	function onData( chunk ){
		if (!buffering)
			classic.pause();

		if (!waiter)
			return buffer.push(chunk);

		cb = waiter;
		waiter = null;
		cb(null, chunk);
	}

	function onEnd(){
		done = true;
		end();
	}

	function onError( err ){
		error = err;
		end();
	}

	function end( v, cb ){
		if (classic) {
			classic.removeListener('data', onData);
			classic.removeListener('response', onResponse);
			classic.removeListener('end', onEnd);
			classic.removeListener('close', onEnd);
			classic.removeListener('error', onError);

			if (typeof classic.abort === 'function')
				classic.abort();

			if (typeof classic.close === 'function')
				classic.close();

			if (typeof classic.destroy === 'function')
				classic.destroy();

			classic = null;
		}

		if (cb)
			return cb(v);

		if (!promise.settled) {
			var err = new TypeError('Connection trouble');
			err.original = error;

			return promise.settle(err, true);
		}

		if (buffering) {
			var data = error || buffer.join('');

			return promiseBody.settle(error || (json ? JSON.parse(data) : data), error);
		}

		if (!waiter)
			return;

		cb = waiter;
		waiter = null;
		source(null, cb);
	}

	function drain(){
		if (!promiseBody) {
			buffering = true;
			promiseBody = new Promise();
			classic.resume();
		}

		return promiseBody;
	}
}
