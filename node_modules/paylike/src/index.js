'use strict';

var assign = require('object-assign');
var fetch = require('pull-fetch-iso');
var toPromise = require('pull-to-promise');

var Cursor = require('./cursor');

var Transactions = require('./transactions');
var Merchants = require('./merchants');
var Cards = require('./cards');
var Apps = require('./apps');

module.exports = Paylike;

function Paylike( key, opts ){
	if (!(this instanceof Paylike))
		return new Paylike(key, opts);

	var service = this.service = new Service({
		url: opts && opts.url,
		key: key || (opts && opts.key),
	});

	this.transactions = new Transactions(service);
	this.merchants = new Merchants(service);
	this.cards = new Cards(service);
	this.apps = new Apps(service);
}

var errors = {
	Error: PaylikeError,
	AuthorizationError: AuthorizationError,
	PermissionsError: PermissionsError,
	NotFoundError: NotFoundError,
	ConflictError: ConflictError,
	ValidationError: ValidationError,
};

assign(Paylike, errors, {
	Transactions: Transactions,
	Merchants: Merchants,
	Cards: Cards,
	Apps: Apps,
	Cursor: Cursor,

	Service: Service,
});

assign(Paylike.prototype, errors, {
	setKey: function( key ){
		this.service.key = key;
	},
});

function Service( opts ){
	this.url = opts.url || 'https://api.paylike.io';
	this.key = opts.key;
	this.agent = opts.agent || 'Node 2.0.2';
}

assign(Service.prototype, {
	Cursor: Cursor,

	get: function( path, query, cb ){
		return toPromise(this.stream('GET', path, query))
			.asCallback(cb);
	},

	post: function( path, body, cb ){
		return toPromise.binary(this.stream('POST', path, null, body))
			.asCallback(cb);
	},

	put: function( path, body, cb ){
		return toPromise(this.stream('PUT', path, null, body), false)
			.asCallback(cb);
	},

	delete: function( path, query, cb ){
		return toPromise.binary(this.stream('DELETE', path, query), false)
			.asCallback(cb);
	},

	stream: function( verb, path, query, body ){
		return httpToError(fetch({
			method: verb,
			host: this.url,
			path: path,
			query: query,
			data: body,
			headers: {
				'Authorization': 'Basic ' + fetch.btoa(':'+this.key),
				'X-Client': this.agent,
			},
		}));
	},
});

function httpToError( read ){
	return function( abort, cb ){
		read(abort, function( end, chunk ){
			if (end === null)
				return cb(null, chunk);

			if (end === true)
				return cb(true);

			if (end.code === 401)
				return cb(new AuthorizationError(end.message));

			if (end.code === 403)
				return cb(new PermissionsError(end.message));

			if (end.code === 404)
				return cb(new NotFoundError(end.message));

			if (end.code === 400)
				return cb(new ValidationError(end.message, end.body));

			if (end.code === 409)
				return cb(new ConflictError(end.message));

			if (end instanceof fetch.response.Error)
				return cb(new PaylikeError(end.message));

			cb(end);
		});
	};
}

function PaylikeError( message ){
	this.message = message;
}

PaylikeError.prototype = Object.create(Error.prototype);
PaylikeError.prototype.toString = function(){ return this.message; };

function AuthorizationError( message ){ this.message = message; }
AuthorizationError.prototype = Object.create(PaylikeError.prototype);

function PermissionsError( message ){ this.message = message; }
PermissionsError.prototype = Object.create(PaylikeError.prototype);

function NotFoundError( message ){ this.message = message; }
NotFoundError.prototype = Object.create(PaylikeError.prototype);

function ConflictError( message ){ this.message = message; }
ConflictError.prototype = Object.create(PaylikeError.prototype);

function ValidationError( message, data ){
	this.message = message;
	this.data = data;
}

ValidationError.prototype = Object.create(PaylikeError.prototype);
