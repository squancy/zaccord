'use strict';

const http = require('http');
const urls = require('url');
const cors = new (require('http-cors'))();
const parseBody = require('http-body-parse');
const parseQuery = require('http-query-parse');

const items = [
	{ letter: 't', },
	{ letter: 'h', },
	{ letter: 'o', },
];

const ndjson = items.reduce(( o, i ) => o+JSON.stringify(i)+'\n', '');
const jsonArray = '[\n'+items.reduce(( o, i ) => o+JSON.stringify(i)+',\n', '')+']\n';

const json = {
	'Content-Type': 'application/json',
};

let release;

module.exports = start;

if (require.main === module)
	start(55237).then(server => console.log(server.address().port));

function start( port ){
	const server = http.createServer(request);

	return new Promise(function( rslv ){
		server.listen(port || 0, function(){
			rslv(server);
		});
	});
}

function request( req, res ){
	if (cors.apply(req, res))
		return res.end();

	const url = urls.parse(req.url);

	url.query = parseQuery(req);

	let mirror;

	switch (url.pathname) {
		case '/echo-url':
			res.writeHead(200, json);

			res.end(JSON.stringify(url));
			break;

		case '/client-error':
			res.writeHead(411, 'Everything went wrong', json);

			res.end(JSON.stringify({
				message: 'Fix it',
			}));
			break;

		case '/server-error':
			res.writeHead(500);
			res.end();
			break;

		case '/string':
			res.writeHead(200, json);

			res.end(JSON.stringify('strong'));
			break;

		case '/boolean':
			res.writeHead(200, json);

			res.end(JSON.stringify(true));
			break;

		case '/single':
			res.writeHead(200, json);

			res.end(JSON.stringify({
				width: 21,
				height: 87,
			}));
			break;

		case '/ndjson':
			res.writeHead(200, json);

			res.end(ndjson);
			break;

		case '/json-array':
			res.writeHead(200, json);

			res.write('[\n');
			items.forEach(i => res.write(JSON.stringify(i)+',\n'));
			res.write(']\n');

			res.end();
			break;

		case '/json-array-bulk':
			res.writeHead(200, json);

			res.end(jsonArray);
			break;

		case '/json-object':
			res.writeHead(200, json);

			res.end(ndjson);
			break;

		case '/lock':
			res.writeHead(200, json);

			release = function(){
				res.end(JSON.stringify('released')+'\n');
			};

			res.write(JSON.stringify('init')+'\n');
			break;

		case '/release':
			res.end();

			release();
			break;

		case '/read':
			res.end();
			break;

		case '/echo-body':
			res.writeHead(200, json);

			parseBody(req)
				.then(body => res.end(JSON.stringify(body)));
			break;

		case '/echo-headers':
			res.writeHead(200, json);

			res.end(JSON.stringify(req.headers));
			break;

		case '/echo-method':
			res.writeHead(200, json);

			res.end(JSON.stringify(req.method));
			break;

		case '/code':
			res.writeHead(url.query.code);
			res.end();
			break;

		default:
			res.writeHead(404);
			res.end();
			break;
	}
}
