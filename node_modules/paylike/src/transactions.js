'use strict';

var assign = require('object-assign');

module.exports = Transactions;

function Transactions( service ){
	this.service = service;
}

assign(Transactions.prototype, {
	// https://github.com/paylike/api-docs#capture-a-transaction
	capture: function( transactionId, opts, cb ){
		return this.service.post('/transactions/'+transactionId+'/captures', {
			amount: opts.amount,
			currency: opts.currency,
			descriptor: opts.descriptor,
		})
			.return()
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#refund-a-transaction
	refund: function( transactionId, opts, cb ){
		return this.service.post('/transactions/'+transactionId+'/refunds', {
			amount: opts.amount,
			descriptor: opts.descriptor,
		})
			.return()
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#void-a-transaction
	void: function( transactionId, opts, cb ){
		return this.service.post('/transactions/'+transactionId+'/voids', {
			amount: opts.amount,
		})
			.return()
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#fetch-a-transaction
	findOne: function( transactionId, cb ){
		return this.service.get('/transactions/'+transactionId)
			.get('transaction')
			.asCallback(cb);
	},
});
