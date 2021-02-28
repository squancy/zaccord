'use strict';

module.exports = isContentType;

function isContentType( header ){
	return header.toLowerCase() === 'content-type';
}
