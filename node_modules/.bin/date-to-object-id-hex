#! /usr/bin/env node
'use strict';

var dateToObjectId = require('./')

var arg = process.argv[2];
var piped = !arg || arg === '-';

var date = piped ? '' : arg;

if (piped) {
	process.stdin
		.on('data', buffer)
		.on('end', finish);
} else {
	finish();
}

function buffer( data ){
	date += data;
}

function finish(){
	console.log(dateToObjectId(new Date(date.replace('\n', ''))));
}
