'use strict';

var test = require('tape');
var stringify = require('./');

test('normalize', function( t ){
	t.deepEqual(stringify.normalize([
		undefined,
		null,
		true,
		false,
		1,
		'a',
		'',
		'&=[]',

		{
			a: undefined,
			b: null,
			c: true,
			d: false,
			e: 'a',
			f: '',
			g: '&=[]',
		},
	]), [
		undefined,
		'',
		'y',
		'n',
		'1',
		'a',
		'',
		'&=[]',

		{
			a: undefined,
			b: '',
			c: 'y',
			d: 'n',
			e: 'a',
			f: '',
			g: '&=[]',
		},
	]);

	t.deepEqual(stringify.normalize({}), {});

	t.end();
});

test('shake', function( t ){
	t.deepEqual(stringify.shake([
		undefined,
		'a',
		undefined,
		'',
		{},
		{ a: undefined },
		{
			a: undefined,
			b: '',
		},
		[],
		[ undefined ],
		[ undefined, '' ],
	]), [
		'a',
		'',
		{ b: '' },
		[ '' ]
	]);

	t.equal(stringify.shake({}), undefined);

	t.end();
});

test('serialize', function( t ){
	t.equal(stringify.serialize({
		a: '',
		b: 's',
		c: [ '1', '2', '3' ],
		d: '&=[]',
		e: [ '1', '2', [ '3', '4' ] ],
		f: [ '1', { a: 1 } ],
	}), 'a=&b=s&c[]=1&c[]=2&c[]=3&d=%26%3D%5B%5D&e[0]=1&e[1]=2&e[2][]=3&e[2][]=4&f[0]=1&f[1][a]=1');

	t.deepEqual(stringify.serialize({}), '');

	t.end();
});

test('stringify', function( t ){
	t.equal(stringify({
		// normalizes
		a: true,

		// shakes
		b: undefined,

		// serializes
		c: '&=[]',
	}), 'a=y&c=%26%3D%5B%5D');

	t.equal(stringify({
		at: new Date(0),
	}), 'at=1970-01-01T00%3A00%3A00.000Z');

	// https://github.com/petkaantonov/querystringparser/issues/3
	t.equal(stringify({
		a: { b: { c: true } },
		d: true,
	}), 'a[b][c]=y&d=y');

	t.equal(stringify({}), '');

	t.equal(stringify({ code: 204 }), 'code=204');

	t.end();
});

test('serialize (from petkaantonov/querystringparser)', function( t ){
	/*

	Tests have been modified where a different result is expected.

	It is only the case for arrays and objects that do not themselves contain
	either (see the README file).

	*/

	// basic

	t.equal(stringify({
		'foo': 'bar'
	}), 'foo=bar');

	t.equal(stringify({
		'foo': 'bar',
		'bar': 'baz'
	}), 'foo=bar&bar=baz');

	t.equal(stringify({
		'foo': '\"bar\"'
	}), 'foo=%22bar%22');

	t.equal(stringify({
		foo: ''
	}), 'foo=');

	t.equal(stringify({
		'foo': '1',
		'bar': '2'
	}), 'foo=1&bar=2');

	t.equal(stringify({
		'my weird field': "q1!2\"'w$5&7/z8)?"
	}), 'my%20weird%20field=q1!2%22\'w%245%267%2Fz8)%3F');

	t.equal(stringify({
		'foo=baz': 'bar'
	}), 'foo%3Dbaz=bar');

	t.equal(stringify({
		foo: 'bar',
		bar: 'baz'
	}), 'foo=bar&bar=baz');

	t.equal(stringify({
		foo: 'bar',
		baz: '',
		raz: ''
	}), 'foo=bar&baz=&raz=');

	// escaping

	t.equal(stringify({
        foo: 'foo bar'
    }), 'foo=foo%20bar');

    t.equal(stringify({
        cht: 'p3',
        chd: 't:60,40',
        chs: '250x100',
        chl: 'Hello|World'
    }), 'cht=p3&chd=t%3A60%2C40&chs=250x100&chl=Hello%7CWorld');

    // nested (some modified)

    var str, obj;

    str = 'foo[]=bar';
	obj = {
		'foo': ['bar']
	};
	t.equal(stringify(obj), str);

	str = 'foo[]=bar&foo[]=quux';
	obj = {
		'foo': ['bar', 'quux']
	};
	t.equal(stringify(obj), str);

	str = 'foo[]=0&foo[]=1';
	obj = {
		'foo': ['0', '1']
	};
	t.equal(stringify(obj), str);

	str = 'foo=bar&baz[]=1&baz[]=2&baz[]=3';
	obj = {
		'foo': 'bar',
		'baz': ['1', '2', '3']
	};
	t.equal(stringify(obj), str);

	str = 'foo[]=bar&baz[]=1&baz[]=2&baz[]=3';
	obj = {
		'foo': ['bar'],
		'baz': ['1', '2', '3']
	};
	t.equal(stringify(obj), str);

	str = 'foo[]=bar&baz[]=1&baz[]=2&baz[]=3';
	obj = {
		'foo': ['bar'],
		'baz': ['1', '2', '3']
	};
	t.equal(stringify(obj), str);

	str = 'x[y][z][]=1';
	obj = {
		'x': {
			'y': {
				'z': ['1']
			}
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][z]=1';
	obj = {
		'x': {
			'y': {
				'z': '1'
			}
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][z]=2';
	obj = {
		'x': {
			'y': {
				'z': '2'
			}
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][z][]=1&x[y][z][]=2';
	obj = {
		'x': {
			'y': {
				'z': ['1', '2']
			}
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z]=1';
	obj = {
		'x': {
			'y': [{
				'z': '1'
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z][]=1';
	obj = {
		'x': {
			'y': [{
				'z': ['1']
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z][]=1';
	obj = {
		'x': {
			'y': [{
				'z': ['1']
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z][]=1';
	obj = {
		'x': {
			'y': [{
				'z': ['1']
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z]=1&x[y][0][w]=2';
	obj = {
		'x': {
			'y': [{
				'z': '1',
				'w': '2'
			}]
		}
	};
	t.equal(stringify(obj), str);


	str = 'x[y][0][v][w]=1';
	obj = {
		'x': {
			'y': [{
				'v': {
					'w': '1'
				}
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z]=1&x[y][0][v][w]=2';
	obj = {
		'x': {
			'y': [{
				'z': '1',
				'v': {
					'w': '2'
				}
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z]=1&x[y][1][z]=2';
	obj = {
		'x': {
			'y': [{
				'z': '1'
			}, {
				'z': '2'
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'x[y][0][z]=1&x[y][0][w]=a&x[y][1][z]=2&x[y][1][w]=3';
	obj = {
		'x': {
			'y': [{
				'z': '1',
				'w': 'a'
			}, {
				'z': '2',
				'w': '3'
			}]
		}
	};
	t.equal(stringify(obj), str);

	str = 'user[name][first]=tj&user[name][last]=holowaychuk';
	obj = {
		user: {
			name: {
				first: 'tj',
				last: 'holowaychuk'
			}
		}
	};
	t.equal(stringify(obj), str);


	t.end();
});
