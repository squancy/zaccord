# JSON parse for pull-streams

The primary goal is to parse [ndjson](http://ndjson.org) (newline delimited
JSON) in a simple and efficient way.

However it also supports opening and closing brackets and commas which is
useful when working with an API that maintains backwards compatibility with
`JSON.parse` while allowing newline delimited parsing. In this case, the
format has to be strictly: `[\n<item>,\n<item>\n]`.

See [pull-json-stringify](https://github.com/srcagency/pull-json-stringify)
for producing either pure ndjson or `JSON.parse`-compatibel newline delimited
JSON, both parsable with this package.


```js
const pull = require('pull-stream');
const parse = require('pull-json-parse');

pull(
	pull.values([
		'{ name: 'Juliet', age: 22 }\n',
		'{ name: 'Romeo', age: 23 }\n',
	]),
	parse,
	pull.collect(( err, json ) => console.log(json))
	/*
	[ { name: 'Juliet', age: 22 }, { name: 'Romeo', age: 23 } ]
	*/
);

pull(
	pull.values([
		'[\n',
		'{ name: 'Juliet', age: 22 }\n',
		'{ name: 'Romeo', age: 23 }\n',
		']',
	]),
	parse,
	pull.collect(( err, json ) => console.log(json))
	/*
	[ { name: 'Juliet', age: 22 }, { name: 'Romeo', age: 23 } ]
	*/
);

pull(
	pull.values([
		'{',
		'"name"',
		':"Juli',
		'et","age"',
		':22',
		'}\n{"name":"Romeo",',
		' "age":23}',
	]),
	parse,
	pull.collect(( err, json ) => console.log(json))
	/*
	[ { name: 'Juliet', age: 22 }, { name: 'Romeo', age: 23 } ]
	*/
);
```
