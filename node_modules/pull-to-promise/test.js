'use strict'

var test = require('tape');
var pull = require('pull-stream');

var toPromise = require('./');

test('A single value', function( t ){
	t.plan(1);

	toPromise(pull.values([ 1 ]))
		.then(function( v ){
			t.equal(v, 1);
		});
});

test('No value', function( t ){
	t.plan(1);

	toPromise(pull.values([]), false)
		.then(function( v ){
			t.equal(v, undefined);
		});
});

test('Any number of values', function( t ){
	t.plan(3);

	toPromise(pull.values([]), true)
		.then(function( v ){
			t.deepEqual(v, []);
		});

	toPromise(pull.values([ 1 ]), true)
		.then(function( v ){
			t.deepEqual(v, [ 1 ]);
		});

	toPromise(pull.values([ 1, 2 ]), true)
		.then(function( v ){
			t.deepEqual(v, [ 1, 2 ]);
		});
});

test('Specific number of values', function( t ){
	t.plan(3);

	toPromise(pull.values([]), 0)
		.then(function( v ){
			t.deepEqual(v, []);
		});

	toPromise(pull.values([ 1 ]), 1)
		.then(function( v ){
			t.equal(v, 1);
		});

	toPromise(pull.values([ 1, 2 ]), 2)
		.then(function( v ){
			t.deepEqual(v, [ 1, 2 ]);
		});
});

test('Unexpected number of values', function( t ){
	t.plan(8);

	toPromise(pull.values([ 1 ]), false)
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise received 1 values expecting 0');
		});

	toPromise(pull.values([]))
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise ended after 0 values expecting 1');
		});

	toPromise(pull.values([ 1, 2 ]))
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise received 2 values expecting 1');
		});

	toPromise(pull.values([ 1 ]), 0)
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise received 1 values expecting 0');
		});

	toPromise(pull.values([]), 1)
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise ended after 0 values expecting 1');
		});

	toPromise(pull.values([ 1, 2 ]), 1)
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise received 2 values expecting 1');
		});

	toPromise(pull.values([ 1 ]), 2)
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise ended after 1 values expecting 2');
		});

	toPromise(pull.values([ 1, 2, 3 ]), 2)
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise received 3 values expecting 2');
		});
});

test('One or no values (binary mode)', function( t ){
	t.plan(3);

	var binary = toPromise.binary;

	binary(pull.values([ 1 ]))
		.then(function( v ){
			t.equal(v, 1);
		});

	binary(pull.values([]))
		.then(function( v ){
			t.equal(v, undefined);
		});

	binary(pull.values([ 1, 2 ]))
		.catch(function( err ){
			t.equal(err.toString(), 'Error: pull-to-promise received 2 values expecting one or zero');
		});
});

test('Shortcuts', function( t ){
	t.plan(3);

	pull(
		pull.values([ 1 ]),
		toPromise
	).then(function( v ){
		t.equal(v, 1);
	});

	pull(
		pull.values([ 1, 2, 3 ]),
		toPromise.any
	).then(function( v ){
		t.deepEqual(v, [ 1, 2, 3 ]);
	});

	pull(
		pull.values([]),
		toPromise.none
	).then(function( v ){
		t.equal(v, undefined);
	});
});
