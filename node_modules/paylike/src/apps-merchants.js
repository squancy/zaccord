'use strict';

var assign = require('object-assign');

module.exports = Merchants;

function Merchants( service ){
	this.service = service;
}

assign(Merchants.prototype, {
	// https://github.com/paylike/api-docs#fetch-all-merchants
	find: function( identityId ){
		return new this.service.Cursor(this.service, '/identities/'+identityId+'/merchants');
	},
})
