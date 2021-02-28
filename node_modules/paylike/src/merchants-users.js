'use strict';

var assign = require('object-assign');

module.exports = Users;

function Users( service ){
	this.service = service;
}

assign(Users.prototype, {
	// https://github.com/paylike/api-docs#invite-user-to-a-merchant
	add: function( merchantId, opts, cb ){
		return this.service.post('/merchants/'+merchantId+'/users', opts)
			.return()
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#revoke-user-from-a-merchant
	revoke: function( merchantId, userId, cb ){
		return this.service.delete('/merchants/'+merchantId+'/users/'+userId)
			.asCallback(cb);
	},

	// https://github.com/paylike/api-docs#fetch-all-users-on-a-merchant
	find: function( merchantId ){
		return new this.service.Cursor(this.service, '/merchants/'+merchantId+'/users');
	},
});
