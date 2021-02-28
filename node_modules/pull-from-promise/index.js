'use strict';

module.exports = promiseToPull;

function promiseToPull( promise, spread ){
	var done = false;
	var queue = false;
	var pos = 0;

	return function again( abort, cb ){
		if (abort)
			return cb(abort);

		if (queue) {
			if (queue.length > pos)
				return cb(null, queue[pos++]);

			return cb(true);
		}

		if (done)
			return cb(true);

		return promise
			.then(function( value ){
				done = true;

				if (!spread)
					return cb(null, value);

				if (!Array.isArray(value))
					throw new Error('promise-to-pull expected an array but got '+value);

				queue = value;

				return again(null, cb);
			})
			.catch(cb);
	}	
}
