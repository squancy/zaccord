'use strict';

var assign = require('object-assign');

var Merchants = require('./apps-merchants');

module.exports = Apps;

function Apps( service ){
	this.service = service;

	this.merchants = new Merchants(service);
}

assign(Apps.prototype, {
	// https://github.com/paylike/api-docs#fetch-current-app
	findOne: function( cb ){
		return this.service.get('/me')
			.get('identity')
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#create-an-app
	create: function( opts, cb ){
		return this.service.post('/apps', opts)
			.get('app')
			.asCallback(cb);
	},
})
