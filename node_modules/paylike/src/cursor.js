'use strict';

var assign = require('object-assign');
var pull = require('pull-stream/pull');
var filter = require('object-filter');
var objectIdFromDate = require('date-to-object-id-hex');
var toPromise = require('pull-to-promise');

module.exports = Cursor;

function Cursor( service, url, batchSize ){
	this._limit = null;
	this._sort = null;
	this._filter = null;
	this._before = null;
	this._after = null;
	this._keepAlive = false;
	this._delay = 5000;
	this._batchSize = batchSize || 50;

	this._service = service;
	this._url = url;

	var cursor = this;

	var size = 0;
	var ask = 0;
	var last;
	var pump;

	this.source = read;

	function read( abort, cb ){
		if (abort)
			return cb && cb(abort);

		if (pump)
			return pump(null, function( end, chunk ){
				if (end !== null) {
					if (end !== true)
						return cb(end);

					pump = null;

					return read(null, cb);
				}

				size++;
				ask--;

				last = chunk;

				return cb(null, chunk);
			});

		if (ask !== 0) {
			if (!cursor._keepAlive)
				return cb(true);

			ask = 0;

			return setTimeout(function(){
				read(null, cb);
			}, cursor._delay);
		}

		ask = cursor._limit
			? Math.min(cursor._batchSize, cursor._limit - size)
			: cursor._batchSize;

		if (ask === 0)
			return cb(true);

		var query = filter({
			before: cursor._before,
			after: cursor._after,
			sort: cursor._sort,
			filter: cursor._filter,
			limit: ask,
		}, isDefined);

		if (last !== undefined) {
			if (query.after && !query.before) {
				query.after = last.id;
			} else {
				query.before = last.id;
			}
		}

		pump = service.stream('GET', url, query);

		read(null, cb);
	}
}

assign(Cursor.prototype, {
	filter: function( filter ){
		this._filter = filter;

		return this;
	},

	sort: function( sort ){
		this._sort = sort;

		return this;
	},

	limit: function( limit ){
		this._limit = limit;

		return this;
	},

	before: function( id ){
		this._before = id;

		return this;
	},

	after: function( id ){
		this._after = id;

		return this;
	},

	until: function( date ){
		this._before = date && objectIdFromDate(date);

		return this;
	},

	since: function( date ){
		this._after = date && objectIdFromDate(date);

		return this;
	},

	batchSize: function( batchSize ){
		this._batchSize = batchSize;

		return this;
	},

	keepAlive: function( delay ){
		if (Number.isInteger(delay))
			this._delay = delay;

		this._keepAlive = delay === undefined
			? true
			: !!delay;

		return this;
	},

	pull: function(){
		var pipes = new Array(arguments.length);

		for (var i = 0;i < pipes.length;i++)
			pipes[i] = arguments[i];

		pipes.unshift(this.source);

		return pull.apply(null, pipes);
	},

	toArray: function( cb ){
		if (this._keepAlive)
			throw new Error('Calling cursor.toArray with "keep alive" would yield a never resolving promise');

		return toPromise(this.source, true)
			.asCallback(cb);
	},
});

function isDefined( f ){
	return f !== undefined && f !== null;
}
