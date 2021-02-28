'use strict';

var assign = require('object-assign');

module.exports = Lines;

function Lines( service ){
	this.service = service;
}

assign(Lines.prototype, {
	// https://github.com/paylike/api-docs#fetch-all-lines-on-a-merchant
	find: function( merchantId ){
		return new this.service.Cursor(this.service, '/merchants/'+merchantId+'/lines');
	},
});
