# Pull stream to promise

Convert a pull stream into a promise.

This library returns [Bluebird](https://github.com/petkaantonov/bluebird/)
promises which are Promises/A+ compliant.

```
toPromise(stream[, expected])	-> Promise(<value>);

toPromise(stream)				-> Promise(<value>);
toPromise(stream, false)		-> Promise();
toPromise(stream, n)			-> Promise(Array(<value>, ..n));
toPromise(stream, true)			-> Promise(Array <values>);
toPromise.binary(stream)		-> Promise(<value | undefined>);
```

`expected` being `false` for no value, `true` for any number of values or an
integer for a specific number of values. If the expected count is not met an
error is thrown.

```js
var pull = require('pull-stream');
var toPromise = require('pull-to-promise');

toPromise(pull(
	pull.values([ 'first', 'second' ]),
	pull.take(1)
))
	.then(console.log);	// "first"
```

```js
toPromise(pull(
	pull.values([ 'first', 'second', 'third' ]),
	pull.take(2)
), true)
	.then(console.log);	// [ "first", "second" ]
```

A few shortcuts exists:

```js
toPromise.any		// toPromise(ps, true)
toPromise.none		// toPromise(ps, false)
toPromise.binary	// toPromise(ps, true).then(throwIfMoreThanOne).get(0)

pull(
	pull.values([ 'first', 'second', 'third' ]),
	pull.take(2),
	toPromise.any
))
	.then(console.log);	// [ "first", "second" ]
```

You may inject your own Promise library if you wish:

```js
var toPromise = require('pull-to-promise');

toPromise.Promise = require('pinkie-promise');
```
