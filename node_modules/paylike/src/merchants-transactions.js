'use strict';

var assign = require('object-assign');

module.exports = Transactions;

function Transactions( service ){
	this.service = service;
}

assign(Transactions.prototype, {
	// https://github.com/paylike/api-docs#create-a-transaction
	create: function( merchantId, opts, cb ){
		return this.service.post('/merchants/'+merchantId+'/transactions', {
				transactionId: opts.transactionId,
				cardId: !opts.transactionId && opts.cardId,

				descriptor: opts.descriptor,
				currency: opts.currency,
				amount: opts.amount,
				custom: opts.custom,
			})
			.get('transaction')
			.get('id')
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#fetch-all-transactions
	find: function( merchantId ){
		return new this.service.Cursor(this.service, '/merchants/'+merchantId+'/transactions');
	},
});
