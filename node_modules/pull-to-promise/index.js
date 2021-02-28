'use strict';

pullToPromise.Promise = require('bluebird');

module.exports = pullToPromise;

pullToPromise.binary = binary;
pullToPromise.any = any;
pullToPromise.none = none;

function pullToPromise( ps, expect ){
	var source = ps.source || ps;

	var specific = typeof expect === 'number';
	var any = expect === true;
	var expected = specific ? expect : (expect === false ? 0 : 1);
	var received = 0;

	var data = any || specific ? [] : undefined;

	return new pullToPromise.Promise(function( rslv, rjct ){
		return read();

		function read(){
			return source(null, function( end, chunk ){
				if (end !== null) {
					if (end !== true)
						return rjct(end);

					if (!any && received < expected)
						return rjct(new Error('pull-to-promise ended after '+received+' values expecting '+expected));

					return rslv(data);
				}

				received++;

				if (!any && received > expected)
					return rjct(new Error('pull-to-promise received '+received+' values expecting '+expected));

				if (any || expected > 1) {
					data.push(chunk);
				} else {
					data = chunk;
				}

				return read();
			});
		}
	});
}

function any( ps ){
	return pullToPromise(ps, true);
}

function none( ps ){
	return pullToPromise(ps, false);
}

function binary( ps ){
	return pullToPromise(ps, true)
		.then(toBinary);
}

function toBinary( r ){
	if (r.length > 1)
		throw new Error('pull-to-promise received '+r.length+' values expecting one or zero');

	return r[0];
}
