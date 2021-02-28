# Change log

This project adheres to [Semantic Versioning](http://semver.org/). This change
log follows the format outlined at http://keepachangelog.com.

## Unreleased

## 2.0.2 - 2017-04-22

### Changed

- Fix bug rendering `cards.findOne` useless

## 2.0.1 - 2017-02-20

### Others

- Upgraded dependencies (`pull-fetch-iso`)

## 2.0.0 - 2017-02-01

### Added

- `keepAlive` method on cursors

	Keeps the stream open instead of closing it when there is no more data.
	Polls for new data every five seconds (configurable).

- `cursor.until` and `cursor.since` convenience methods

	Pass a `Date` directly to `since` or `until` to query data within a given
	timeframe.

### Changed

- Fix order bug when using `cursor.after` and `cursor.before` simultaneously
- Switched to [pull-streams](https://github.com/pull-stream/pull-stream)

	All cursors are now pull streams as opposed to classic Node.js streams.
	The reasons being:

	- *Much* smaller footprint for browser bundles as classic streams are
	  complex and require events, buffers, etc.
	- Less opinionated
	- Does not impose any libraries on the consumer (e.g. `readable-stream`)

	The `.stream()` method has been removed as it is no longer needed.

	The `.toArray()` method is unaffacted and code using it will continue to
	work without change.

	Examples of migrating to pull streams with the least possible impact:

	*Before:*

	```js
	merchants
		.transactions
		.find(merchantId)
		.stream()
		.pipe(...)
	```

	*After:*

	```js
	var toStream = require('pull-stream-to-stream');

	toStream.source(merchants
		.transactions
		.find(merchantId))
		.pipe(...)
	```

	If you do not already know about pull streams, I would like to encourage
	you to read [Dominic Tarr's introduction](http://dominictarr.com/post/149248845122/pull-streams-pull-streams-are-a-very-simple).

- Calling `cursor.keepAlive` without an argument is now equivalent to passing
  `true`

## 1.1.0 - 2017-01-20

### Added

- `cards.findOne` method for retrieving a single card

### Removed

- `cursor.skip`

	The method was never documented as it was deprecated when this client
	started. It is no longer supported by the server API.

### Others

- Removed unused function parameters

## 1.0.1 - 2016-05-01

### Others

- Upgraded dependencies
- Removed unused dependencies
- Expose some low level methods
- Update version header

## 1.0.0 - 2016-01-17

### Added

- optional [`highWaterMark`](https://nodejs.org/api/stream.html#stream_class_stream_readable_1) parameter for `stream` method
- HTTP header to gossip about client version (for debugging)

## 0.0.8 - 2016-01-16

### Changed

- default service URL is now `api.paylike.io`

	The new service comes with a bunch of changes, but few are relevant to the
	Node client:

	- **replace pk with id**

		**If you are using the Node.js client, and not relying on the response of
		failed requests, this is the only change affecting you.**

		This is the most significant change as it concerns all `GET` responses as
		well as `POST` and `PUT` input data which references other documents
		through its primary key (id).

		The change is motivated by occasional confusion with a merchant account's
		"public key" (found as `key` on the merchant document).

	- paginated endpoints return arrays directly in the body

		Previously paginated endpoints (e.g. `/merchants/[merchantId]/transactions`) would return an object such as:

		```js
		{
			transactions: [ .. ],
			pagination: { .. },
		}
		```

		These endpoints will now simply return the array inside:

		```js
		[ .. ]
		```

	- all paginated endpoints returns newest documents first

		A few endpoints were returning the newest document last:

		- `/identities/[identityId]/merchants`
		- `/merchants/[merchantId]/users`
		- `/merchants/[merchantId]/apps`

		In the future we will introduce custom sorting and filtering.

	- remove pagination object from responses

		Previously a "pagination" object was returned alongside the data, those
		are no longer included.

	- better HTTP status codes (see https://github.com/paylike/api-docs/blob/master/status-codes.md)
	- new error messages (for consistency)
	- `DELETE` requests no longer return data
	- `PUT` requests no longer return data


### Added

- new error type `ConflictError`

	Thrown when a request was unable to complete due to a constraint or
	conflict with existing data.

## 0.0.7 - 2015-12-17

### Changed

- default service URL changed (reverted)

## 0.0.6 - 2015-12-14

### Added

- new cursor methods: `before` and `after`

## 0.0.5 - 2015-11-25

### Added

- `apps.merchants.find`
- `merchants.transactions.create`
- `merchants.transactions.find`

### Removed

- `merchants.find` (replaced by `apps.merchants.find`)
- `transactions.create` (replaced by `merchants.transactions.create`)
- `transactions.find` (replaced by `merchants.transactions.find`)

## 0.0.4 - 2015-11-25

### Added

- `setKey` (set key for authentication)
- `apps.create`
- `merchants.update`
- `merchants.users.add`
- `merchants.users.revoke`
- `merchants.users.find`
- `merchants.apps.add`
- `merchants.apps.revoke`
- `merchants.apps.find`
- `merchants.lines.find`

### Changed

- Renamed constructor option `api` to `url`
- Externalized http request logic

### Removed

- `merchants.invite` (replaced by `merchants.users.add`)

### Others

- Upgrade dependencies (Bluebird being the most notable)
- Removed unused dependencies

## 0.0.3 - 2015-10-15 (first working release)

### Changed

- Fixed repository URL in package.json
- Remove license from package.json (we need to research a bit)
