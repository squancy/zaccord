# Pull stream from Promise

Convert a Promise into a pull stream source.

```
fromPromise(Promise <promise>[, Boolean <spread>])	-> PullStream

fromPromise(Promise <promise>)						-> PullStream
fromPromise(Promise(Array) <promise>, true)			-> PullStream
```

Call with `true` for the `spread` parameter and the promise will be expected
to resolve to an array and each item be pushed to the pull stream.

```js
var pull = require('pull-stream');
var formPromise = require('pull-from-promise');

pull(
	fromPromise(Promise.resolve('something')),
	pull.collect(function( err, array ){
		console.log(array);	// [ 'something' ]
	})
);
```

```js
var pull = require('pull-stream');
var formPromise = require('pull-from-promise');

pull(
	fromPromise(Promise.resolve([ 1, 2, 3 ]), true),
	pull.collect(function( err, array ){
		console.log(array);	// [ 1, 2, 3 ]
	})
);
```
