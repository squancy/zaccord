'use strict';

var Promise = require('bluebird');
var test = require('tape');
var assign = require('object-assign');
var pullToPromise = require('pull-to-promise');

var server = typeof window === 'undefined' && require('./server')(0);

var host = server ? server.then(function( server ){
	return 'http://localhost:'+server.address().port;
}) : Promise.resolve('http://localhost:55237');

var fetch = require('../src');

var canStream = typeof window === 'undefined' || (window.Response && window.Response.prototype.hasOwnProperty('body'));

test('btoa', function( t ){
	t.equal(fetch.btoa('Picasso'), 'UGljYXNzbw==');
	t.end();
});

test('To querystring', function( t ){
	t.equal(fetch.toQs({
		n: '123',
		x: {
			y: '"\'&/?=[]()',
		},
	}), 'n=123&x[y]=%22\'%26%2F%3F%3D%5B%5D()');

	t.end();
});

test('A string', function( t ){
	t.plan(1);

	fetchOne({
		path: '/string',
	}).then(function( body ){
		t.deepEqual(body, 'strong');
	});
});

test('A primitive', function( t ){
	t.plan(1);

	fetchOne({
		path: '/boolean',
	}).then(function( body ){
		t.deepEqual(body, true);
	});
});

test('An object', function( t ){
	t.plan(1);

	fetchOne({
		path: '/single',
	}).then(function( body ){
		t.deepEqual(body, {
			width: 21,
			height: 87,
		});
	});
});

test('Using `url` only', function( t ){
	t.plan(1);

	host.then(function( host ){
		return pullToPromise(fetch({
			url: host+'/echo-url',
		}));
	}).then(function( body ){
		t.deepEqual(body, {
			auth: null,
			hash: null,
			host: null,
			hostname: null,
			href: '/echo-url',
			path: '/echo-url',
			pathname: '/echo-url',
			port: null,
			protocol: null,
			query: {},
			search: null,
			slashes: null,
		});
	});
});

test('With a query', function( t ){
	t.plan(1);

	var query = {
		n: '123',
		x: {
			y: '"\'&/?=[]()',
		},
	};

	fetchOne({
		path: '/echo-url',
		query: query,
	}).then(function( body ){
		t.deepEqual(body.query, query);
	});
});

test('Query as a string', function( t ){
	t.plan(1);

	fetchOne({
		path: '/echo-url',
		query: 'i=n&u=y',
	}).then(function( body ){
		t.deepEqual(body.query, { i: 'n', u: 'y' });
	});
});

test('POST JSON', function( t ){
	t.plan(1);

	var data = {
		x: 129,
		y: 9,
	};

	fetchOne({
		path: '/echo-body',
		data: data,
	}).then(function( body ){
		t.deepEqual(body, data);
	});
});

test('Standard GET headers', function( t ){
	t.plan(2);

	fetchOne({
		path: '/echo-headers',
	}).then(function( body ){
		t.notOk(body.contentType);
		t.equal(body.accept, 'application/json');
	});
});

test('Additional headers', function( t ){
	t.plan(1);

	fetchOne({
		path: '/echo-headers',
		headers: {
			'x-client-version': '1.0.0',
		},
	}).then(function( body ){
		t.equal(body['x-client-version'], '1.0.0');
	});
});

test('PATCH request', function( t ){
	t.plan(1);

	fetchOne({
		method: 'PATCH',
		path: '/echo-method',
	}).then(function( body ){
		t.equal(body, 'PATCH');
	});
});

test('Sending DELETE with data', function( t ){
	t.plan(1);

	fetchNone({
		method: 'DELETE',
		data: 'anything',
	}).catch(function( err ){
		t.equal(err.message, 'You should not send data for DELETE or GET requests');
	});
});

test('Status code 204 (no content)', function( t ){
	t.plan(1);

	fetchNone({
		path: '/code',
		query: { code: 204 },
	}).then(function( body ){
		t.equal(body, undefined);
	});
});

test('Status code 205 (no content)', function( t ){
	t.plan(1);

	fetchNone({
		path: '/code',
		query: { code: 205 },
	}).then(function( body ){
		t.equal(body, undefined);
	});
});

test('Client error', function( t ){
	t.plan(3);

	fetchOne({
		path: '/client-error',
	}).catch(function( err ){
		t.ok(err instanceof fetch.response.ClientError);
		t.ok(err instanceof fetch.response.Error);

		t.deepEqual(err, {
			code: 411,
			message: 'Everything went wrong',
			headers: null,
			body: {
				message: 'Fix it',
			},
		});
	});
});

test('Server error', function( t ){
	t.plan(3);

	fetchOne({
		path: '/server-error',
	}).catch(function( err ){
		t.ok(err instanceof fetch.response.ServerError);
		t.ok(err instanceof fetch.response.Error);

		t.deepEqual(err, {
			code: 500,
			message: 'Internal Server Error',
			headers: null,
			body: '',
		});
	});
});

test('Unknown host', function( t ){
	t.plan(2);

	fetchOne({
		url: 'http://somewhere-on-mars'
	}).catch(function( err ){
		t.ok(err instanceof TypeError);
		t.notOk(err instanceof fetch.response.Error);
	});
});

test('Newline delimited JSON', function( t ){
	t.plan(1);

	fetchMany({
		path: '/ndjson',
	}).then(function( body ){
		t.deepEqual(body, [ { letter: 't' }, { letter: 'h' }, { letter: 'o' } ]);
	});
});

test('JSON array', function( t ){
	t.plan(1);

	fetchMany({
		path: '/json-array',
	}).then(function( body ){
		t.deepEqual(body, [ { letter: 't' }, { letter: 'h' }, { letter: 'o' } ]);
	});
});

test('JSON array (bulk)', function( t ){
	t.plan(1);

	fetchMany({
		path: '/json-array-bulk',
	}).then(function( body ){
		t.deepEqual(body, [ { letter: 't' }, { letter: 'h' }, { letter: 'o' } ]);
	});
});

test({
	skip: !canStream,
}, 'Are we streaming?', function( t ){
	t.plan(2);

	host
		.then(function( host ){
			var source = fetch({
				host: host,
				path: '/lock',
			});

			var released = false;
			var received = false;

			read();

			function read(){
				return source(null, function( end, item ){
					if (end) {
						if (!received)
							t.fail();

						return;
					}

					if (item === 'init' && !released) {
						released = true;

						fetchNone({
							path: '/release',
						}).then(function(){
							t.pass();
						});
					}

					if (item === 'released') {
						received = true;

						if (released)
							t.pass();
						else
							t.fail();
					}

					return read();
				});
			}
		});
});

test('teardown', function( t ){
	if (server)
		server.then(function( server ){
			server.close();
		});

	t.end();
});

function fetchNone( opts ){
	return fetchMany(opts, false);
}

function fetchOne( opts ){
	return fetchMany(opts, null);
}

function fetchMany( opts, n ){
	return host.then(function( host ){
		return pullToPromise(fetch(assign({
			host: host,
		}, opts)), n === undefined ? true : n);
	});
}
