'use strict';

var assign = require('object-assign');

var Apps = require('./merchants-apps');
var Users = require('./merchants-users');
var Lines = require('./merchants-lines');
var Transactions = require('./merchants-transactions');

module.exports = Merchants;

function Merchants( service ){
	this.service = service;

	this.apps = new Apps(service);
	this.users = new Users(service);
	this.lines = new Lines(service);
	this.transactions = new Transactions(service);
}

assign(Merchants.prototype, {
	// https://github.com/paylike/api-docs#create-a-merchant
	create: function( opts, cb ){
		return this.service.post('/merchants', opts)
			.get('merchant')
			.get('id')
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#update-a-merchant
	update: function( merchantId, opts, cb ){
		return this.service.put('/merchants/'+merchantId, opts)
			.asCallback(cb);
	},

	//  https://github.com/paylike/api-docs#fetch-a-merchant
	findOne: function( merchantId, cb ){
		return this.service.get('/merchants/'+merchantId)
			.get('merchant')
			.asCallback(cb);
	},
});
