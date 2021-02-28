'use strict';

module.exports = Promise;

function Promise( value ){
	this.then = then;
	this.catch = fail;
	this.settle = settle;
}

function settle( value, reject ){
	this.value = value;
	this.settled = true;
	this.rejected = reject;

	if (reject && this.onFail)
		this.onFail(this.value);

	if (!reject && this.onSuccess)
		this.onSuccess(this.value);

	return this;
}

function then( success ){
	this.onSuccess = success;

	if (this.settled && !this.rejected)
		this.onSuccess(this.value);

	return this;
}

function fail( fail ){
	this.onFail = fail;

	if (this.settled && this.rejected)
		this.onFail(this.value);

	return this;
}
