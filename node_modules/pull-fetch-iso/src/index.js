'use strict';

var find = require('array-find');
var btoa = require('btoa-lite');
var jsonParse = require('pull-json-parse');
var promiseToPull = require('pull-from-promise');
var toQs = require('http-querystring-stringify');

var appendQuery = require('./append-query');
var responses = require('./responses');
var isContentType = require('./is-content-type');
var isAccept = require('./is-accept');
var ponyFetch = require('./fetch-ponyfill');

var fetch = typeof window !== 'undefined' && window.fetch || ponyFetch;
var FormData = typeof window !== 'undefined' && window.FormData;
var File = typeof window !== 'undefined' && window.File;
var TextDecoder = typeof window !== 'undefined' && window.TextDecoder;

var responseMap = {
	1: responses.Error,
	2: responses.Success,
	3: responses.Error,
	4: responses.ClientError,
	5: responses.ServerError,
};

var methodsWithoutBody = [ 'GET', 'DELETE' ];

request.response = responses;
request.toQs = toQs;
request.btoa = btoa;

module.exports = request;

function request( opts ){
	var pump = null;
	var retries = 0;

	return source;

	function source( abort, cb ){
		if (abort)
			return cb && cb(abort);

		if (pump)
			return pump(null, cb);

		send(opts)
			.then(function( response ){
				var code = response.status;

				var contentType = response.headers.get('content-type');

				var json = contentType && contentType.indexOf('json') !== -1;

				if (!response.ok)
					return (json ? response.json() : response.text())
						.then(function( body ){
							var statusIdentifier = code && (code / 100 | 0);
							var responseType = responseMap[statusIdentifier] || responses.Error;

							return cb(new responseType(code, response.statusText || 'Connection trouble', null, body));
						});

				if (code === 204 || code === 205)
					return cb(true);

				pump = json
					? pumpJson(response)
					: pumpBinary(response);

				return pump(null, cb);
			})
			.catch(function( err ){
				if (!opts.retries)
					return cb(err);

				var retry = opts.retries[retries];

				if (retry === undefined)
					return cb(err);

				retries++;

				if (!retry.delay)
					return source(null, cb);

				setTimeout(function(){
					source(null, cb);
				}, retry.delay);
			})
			.catch(cb);
	}
}

function send( opts ){
	var url = typeof opts === 'string'
		? opts
		: appendQuery(opts.url || opts.host+(opts.path || ''), opts.query);

	var method = opts.method || (opts.data ? 'POST' : 'GET');
	var headers = opts.headers || {};
	var data = opts.data;

	var isMethodWithBody = methodsWithoutBody.indexOf(method) === -1;

	var headerKeys = Object.keys(headers);

	var contentTypeHeader = find(headerKeys, isContentType);
	var acceptHeader = find(headerKeys, isAccept);

	if (
		isMethodWithBody
		&& contentTypeHeader === undefined
		&& !(File && data instanceof File)
		&& !(FormData && data instanceof FormData)
	)
		headers['Content-Type'] = 'application/json';

	if (acceptHeader === undefined)
		headers.Accept = 'application/json';

	var contentType = headers[contentTypeHeader || 'Content-Type'];

	var body;

	if (data) {
		if (!isMethodWithBody)
			throw new Error('You should not send data for DELETE or GET requests');

		if (contentType === 'application/json') {
			body = JSON.stringify(data);
		} else {
			body = data;
		}
	}

	return fetch(url, {
		method: method,
		headers: fetch.isPony
			? headers
			: Object.keys(headers).reduce(function( c, key ){
				c.append(key, headers[key]);

				return c;
			}, new Headers()),
		body: body,
	});
}

function pumpJson( response ){
	if (response.source)
		return jsonParse(response.source);

	var reader = TextDecoder && response.body && response.body.getReader();

	if (!reader)
		return jsonParse(promiseToPull(response.text()));

	var decoder = new TextDecoder();
	var done = false;

	return jsonParse(function( abort, cb ){
		if (abort) {
			reader.cancel();

			return cb(abort);
		}

		if (done)
			return cb(true)

		return reader.read().then(function( chunk ){
			done = chunk.done;

			return cb(null, decoder.decode(chunk.value || new Uint8Array, {
				stream: chunk.done,
			}));
		}).catch(cb);
	});
}

function pumpBinary( response ){
	if (response.source)
		return response.source;

	var reader = response.body && response.body.getReader();

	if (!reader)
		return promiseToPull(response.text());

	return function pump( abort, cb ){
		if (abort) {
			reader.cancel();

			return cb(abort);
		}

		return reader.read().then(function( chunk ){
			if (chunk.done)
				return cb(true);

			return cb(null, chunk.value);
		}).catch(cb);
	}
}
