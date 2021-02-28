'use strict';

var stringify = require('http-querystring-stringify');

module.exports = appendQuery;

function appendQuery( url, data ){
	if (data === undefined || data === null || data === false)
		return url;

	var query = typeof data === 'string'
		? data
		: stringify(data);

	if (!query)
		return url;

	var delimiter = url.indexOf('?') === -1
		? '?'
		: '&';

	return url+delimiter+query;
}
