'use strict';

module.exports = isAccept;

function isAccept( header ){
	return header.toLowerCase() === 'accept';
}
