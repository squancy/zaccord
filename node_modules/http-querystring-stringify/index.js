'use strict';

toQuerystring.serialize = serialize;
toQuerystring.shake = shake;
toQuerystring.normalize = normalize;

module.exports = toQuerystring;

function toQuerystring( i ){
	var shaken = shake(normalize(i));

	if (shaken === undefined)
		return '';

	return serialize(shaken);
}

function serialize( i, prefix ){
	if (Array.isArray(i)) {
		var hasComplex = i.some(isComplex);

		return i.map(function( i, idx ){
			return serialize(i, prefix+(hasComplex
				? '['+idx+']'
				: '[]'));
		}).join('&');
	}

	if (typeof i === 'object')
		return Object.keys(i).map(function( key ){
			return serialize(i[key], prefix === undefined
				? encodeURIComponent(key)
				: prefix+'['+encodeURIComponent(key)+']');
		}).join('&');

	return prefix+'='+encodeURIComponent(i);
}

function shake( i ){
	if (i === undefined)
		return;

	if (Array.isArray(i)) {
		var shaken = i.map(shake).filter(isDefined);

		if (shaken.length === 0)
			return;

		return shaken;
	}

	if (typeof i === 'object') {
		var empty = true;

		var shaken = Object.keys(i).reduce(function( o, key ){
			var shaken = shake(i[key]);

			if (shaken !== undefined) {
				empty = false;

				o[key] = shaken;
			}

			return o;
		}, {});

		if (empty)
			return;

		return shaken;
	}

	return i;
}

function normalize( i ){
	if (i === undefined)
		return undefined;

	if (i === null)
		return '';

	if (i === true)
		return 'y';

	if (i === false)
		return 'n';

	if (typeof i.toJSON === 'function')
		return normalize(i.toJSON());

	var type = typeof i;

	if (type === 'string')
		return i;

	if (Array.isArray(i))
		return i.map(normalize);

	if (type === 'object')
		return Object.keys(i).reduce(function( o, key ){
			o[key] = normalize(i[key]);

			return o;
		}, {});

	return i+'';
}

function isDefined( i ){
	return i !== undefined;
}

function isComplex( i ){
	if (Array.isArray(i))
		return true;

	if (typeof i === 'object')
		return true;

	return false;
}
