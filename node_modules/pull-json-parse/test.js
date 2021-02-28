'use strict';

var pull = require('pull-stream');
var test = require('tape');

var parse = require('./');

var a = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ];
var c = [ { name: 'Juliet', age: 22 }, { name: 'Romeo', age: 23 } ];

[
	[ '"first"\n|"second"\n|"third"\n|"fourth"\n|"fifth"\n|"sixth"\n', a ],
	[ '"fi||rs|t"|\n|"second"|\n"third|"|\n"fourth"\n"fifth"\n"s|ixth"\n', a ],
	[ '"first"\n"second"\n"third"\n"fourth"\n"fifth"\n"sixth"', a ],
	[ '"first",\n"second",\n"third",\n"fourth",\n"fifth",\n"sixth",', a ],
	[ '"first",\n"second",\n"third",\n"fourth",\n"fifth",\n"sixth",\n', a ],
	[ '[\n"first",\n"second",\n"third",\n"fourth",\n"fifth",\n"sixth",\n]', a ],
	[ '[\n"first",\n"second",\n"third",\n"fourth",\n"fifth",\n"sixth",\n]\n', a ],
	[ '[|\n|"first",\n"second",\n"third",\n"fourth",\n"fifth",\n"sixth"|\n]', a ],
	[ '[\n|"first",\n"second",\n"third",\n"fourth",\n"fifth",\n"sixth"\n|]', a ],
	[ '[\n{"name":"Juliet","age":22},\n{"name":"Romeo","age":23}\n]', c ],
	[ '[\n{"name|":|"Juliet",|"age"|:|2|2}|,|\n|{"name":"Ro|meo"|,"age"|:23}\n]', c ],
	[ '{"name":"Juliet","age":22}\n{"name":"Romeo","age":23}', c ],
	[ 'true', [ true ] ],
	[ '"ping"', [ 'ping' ] ],
	[ '[\n]', [] ],
	[ '[\n\n]', [] ],
	[ '[\ntrue\n\n]', [ true ] ],
	[ '[\n|\ntrue\n|\n|\n\n|\n]', [ true ] ],
].forEach(function( set ){
	test(function( t ){
		t.plan(1);

		pull(
			pull.values(set[0].split('|')),
			parse,
			pull.collect(function( err, result ){
				t.deepEqual(result, set[1]);
			})
		);
	});
});

test(function( t ){
	t.plan(1);

	pull(
		pull.values([ new Buffer(JSON.stringify('Hidden string'), 'utf8') ]),
		parse,
		pull.collect(function( err, result ){
			t.deepEqual(result, [ 'Hidden string' ]);
		})
	);
});
