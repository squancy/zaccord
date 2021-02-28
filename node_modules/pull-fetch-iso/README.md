# Pull fetch isomorphic

```js
var fetch = require('pull-fetch-iso');
var toPromise = require('pull-to-promise');

pull(
	fetch({
		url: 'http://localhost/books.ndjson',

		retries: [
			{ delay: 100 },
			{ delay: 2000 },
			{ delay: 10000 },
		],
	}),

	pull.log()
);

toPromise(fetch({
	url: 'http://localhost/books/the-little-mermaid.json',

	retries: [
		{ delay: 100 },
		{ delay: 2000 },
		{ delay: 10000 },
	],
}))
	.then(console.log);
```

```js
fetch({
	retries

	// complete URL, `query` appended, overwrites `host` and `path`
	url

	// will be concatenated
	host
	path

	/*
	A string will simply be appended to the URL while an object will be
	stringified by `http-querystring-stringify`
	*/
	query

	method

	headers: {
		name: value
	}

	/*
	A JSON serializable value, a DOM File or DOM FormData. Any value. Will be
	stringified if the "Content-Type" header is not overwritten and it is not
	a DOM File or FormData.
	*/
	data
});
```
