'use strict';

var Promise = require('./promise-standin');

fetch.isPony = true;

module.exports = fetch;

function fetch( url, opts ){
	var r = new XMLHttpRequest();

	r.open(opts.method, url);

	Object.keys(opts.headers).forEach(function( key ){
		r.setRequestHeader(key, opts.headers[key]);
	});

	var promise = new Promise();

	r.addEventListener('readystatechange', function(){
		if (r.readyState !== 4)
			return;

		var code;
		var message;
		var body;

		try { code = r.status } catch(e) { code = 0; }
		try { message = r.statusText } catch(e) {}
		try { body = r.responseText; } catch(e) {}

		if (code === 0)
			return promise.settle(new TypeError('Connection trouble'), true);

		promise.settle({
			status: code,
			statusText: message,
			ok: code >= 200 && code < 300,
			text: function(){
				return new Promise().settle(body);
			},
			json: function(){
				return new Promise().settle(JSON.parse(body));
			},
			headers: {
				get: function( key ){
					try {
						return r.getResponseHeader(key);
					} catch(e) {}
				},
			},
		});
	});

	r.send(opts.body);

	return promise;
}
