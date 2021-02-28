'use strict';

module.exports = {
	Success: Success,
	Error: ErrorResponse,
	Redirect: Redirect,
	ClientError: ClientError,
	ServerError: ServerError,
};

function Response( code, message, headers, body ){
	this.code = code;
	this.message = message;
	this.headers = headers;
	this.body = body;
}

Response.prototype.toString = responseToString;

function ErrorResponse(){
	Response.apply(this, arguments);
}

ErrorResponse.prototype = Object.create(Error.prototype);
ErrorResponse.prototype.toString = responseToString;

// 200 - success (resolved)
function Success(){
	Response.apply(this, arguments);
}

Success.prototype = Object.create(Response.prototype);

// 300 - redirection (resolved)
function Redirect(){
	Response.apply(this, arguments);
}

Redirect.prototype = Object.create(Response.prototype);

// 400 - client error (rejected)
function ClientError(){
	Response.apply(this, arguments);
}

ClientError.prototype = Object.create(ErrorResponse.prototype);

// 500 - server error (rejected)
function ServerError(){
	Response.apply(this, arguments);
}

ServerError.prototype = Object.create(ErrorResponse.prototype);

function responseToString(){
	return this.code+': '+this.message;
}
