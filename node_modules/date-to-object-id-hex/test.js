'use strict';

const test = require('tape');
const toHex = require('./');
const toDate = require('date-from-object-id');

test(function( t ){
	t.equal(toHex(new Date('2016-12-20T22:12:08.379Z')), '5859acb80000000000000000');
	t.equal(toHex(new Date('2016-12-12T22:00:00.000Z')), '584f1de00000000000000000');
	t.equal(toHex(new Date('1970-01-01T00:01:00.000Z')), '0000003c0000000000000000');

	t.equal(toHex(1482271908897), '5859aca40000000000000000');

	t.throws(function(){
		toHex(new Date('1960-01-01T00:01:00.000Z'));
	});

	t.equal(+toDate(toHex(1482271908897)), 1482271908000);

	t.end();
});
