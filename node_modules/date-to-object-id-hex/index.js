'use strict';

module.exports = dateToHexId;

function dateToHexId( date ){
	var unix = date / 1000;

	if (unix < 0)
		throw new Error('Cannot create a MongoDB ObjectId hex from a date before 1970-01-01');

	return pad(8, Math.floor(unix).toString(16))+'0000000000000000';
}

function pad( length, hex ){
	return (new Array(length - hex.length + 1)).join('0')+hex;
}
