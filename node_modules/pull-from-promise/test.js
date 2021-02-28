'use strict'

var test = require('tape');
var toPromise = require('pull-to-promise');

var fromPromise = require('./');

test(function( t ){
	t.plan(1);

	toPromise(fromPromise(Promise.resolve(true))).then(function( v ){
		t.equal(v, true);
	});
});

test(function( t ){
	t.plan(1);

	toPromise(fromPromise(Promise.resolve())).then(function( v ){
		t.equal(v, undefined);
	});
});

test(function( t ){
	t.plan(1);
	
	var list = [ 1, 2, 3 ];

	toPromise(fromPromise(Promise.resolve(list))).then(function( v ){
		t.equal(v, list);
	});
});

test(function( t ){
	t.plan(1);

	var error = new Error('Something');

	toPromise(fromPromise(Promise.reject(error))).catch(function( v ){
		t.equal(v, error);
	});
});

test(function( t ){
	t.plan(2);

	var list = [ 1, 2, 3 ];

	toPromise(fromPromise(Promise.resolve(list), true), null).then(function( v ){
		t.notEqual(v, list);
		t.deepEqual(v, list);
	});
});

test(function( t ){
	t.plan(2);

	var list = [];

	toPromise(fromPromise(Promise.resolve(list), true), null).then(function( v ){
		t.notEqual(v, list);
		t.deepEqual(v, list);
	});
});

test(function( t ){
	t.plan(2);

	var list = [ 1 ];

	toPromise(fromPromise(Promise.resolve(list), true), null).then(function( v ){
		t.notEqual(v, list);
		t.deepEqual(v, list);
	});
});

test(function( t ){
	t.plan(1);

	toPromise(fromPromise(Promise.resolve('list'), true))
		.catch(function( err ){
			t.equal(err.toString(), 'Error: promise-to-pull expected an array but got list');
		});
});
