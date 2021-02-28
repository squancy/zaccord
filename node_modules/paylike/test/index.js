'use strict';

var Promise = require('bluebird');
var test = require('tape');

var paylike = require('../')('4ff7de37-dddf-4e51-8cc9-48b61a102923');

var appId = '555eca95ed59804d2cf12b11';
var merchantId = '55006bdfe0308c4cbfdbd0e1';
var transactionId = '560fd96b7973ff3d2362a78c';

var merchantAttributes = {
	company: {
		country: 'DK',
	},
	currency: 'DKK',
	email: 'john@example.com',
	website: 'https://example.com',
	descriptor: 'Coffee & John',
	test: true,
};

test('apps', function( t ){
	var apps = paylike.apps;

	t.test('create', function( t ){
		t.plan(1);

		apps
			.create({
				name: 'Coffee & John',
			})
			.tap(function( app ){
				t.ok(app, 'app');
			});
	});

	t.test('find one', function( t ){
		t.plan(1);

		apps
			.findOne()
			.tap(function( app ){
				t.equal(app.id, appId, 'app id');
			});
	});

	t.test('merchants', function( t ){
		t.test('find', function( t ){
			t.plan(3);

			var cursor = apps.merchants.find(appId);

			var all = cursor
				.limit(10)
				.toArray();

			all.then(function( merchants ){
				t.ok(Array.isArray(merchants), 'toArray gives an array');
			});

			var selection = apps
				.merchants
				.find(appId)
				.filter({ test: true })
				.limit(2)
				.toArray();

			Promise
				.join(all, selection)
				.spread(function( merchants, selection ){
					t.equal(selection.length, 2);

					t.deepEqual(selection, merchants.splice(0, 2));
				});
		});
	});
});

test('merchants', function( t ){
	var merchants = paylike.merchants;

	t.test('find one', function( t ){
		t.plan(1);

		merchants
			.findOne(merchantId)
			.then(function( merchant ){
				t.equal(merchant.id, merchantId, 'primary key');
			});
	});

	t.test('create', function( t ){
		t.test('validation error', function( t ){
			t.plan(2);

			merchants
				.create()
				.tap(function(){
					t.fail();
				})
				.catch(paylike.ValidationError, function( e ){
					t.ok(e.message, 'message');
					t.ok(Array.isArray(e.data), 'array of data');
				});
		});

		t.test(function( t ){
			t.plan(1);

			merchants
				.create(merchantAttributes)
				.tap(function( id ){
					t.equal(typeof id, 'string', 'merchant id');
				});
		});
	});

	t.test('update', function( t ){
		t.plan(1);

		merchants
			.create(merchantAttributes)
			.then(function( merchantId ){
				return merchants.update(merchantId, { name: 'Coffee John' });
			})
			.tap(function( r ){
				t.equal(typeof r, 'undefined', 'returned value');
			})
			.catch(function(){
				t.fail('should not throw');
			});
	});

	t.test('users', function( t ){
		t.test('add', function( t ){
			t.plan(1);

			merchants
				.create(merchantAttributes)
				.then(function( merchantId ){
					return merchants.users.add(merchantId, { email: 'one@example.com' });
				})
				.tap(function( r ){
					t.equal(typeof r, 'undefined', 'returned value');
				})
				.catch(function(){
					t.fail('should not throw');
				});
		});

		t.test('revoke', function( t ){
			t.plan(1);

			var merchantId = merchants.create(merchantAttributes);
			var added = merchantId
				.then(function( merchantId ){
					return merchants.users.add(merchantId, { email: 'two@example.com' });
				});

			var userId = Promise
				.join(merchantId, added)
				.spread(function( merchantId ){
					return merchants.users.find(merchantId);
				})
				.call('limit')
				.call('toArray')
				.get(0)
				.get('id');

			Promise
				.join(merchantId, userId)
				.spread(function( merchantId, userId ){
					return merchants.users.revoke(merchantId, userId);
				})
				.tap(function( r ){
					t.equal(typeof r, 'undefined', 'returned value');
				})
				.catch(function(){
					t.fail('should not throw');
				});
		});

		t.test('find', function( t ){
			t.plan(2);

			var merchantId = merchants.create(merchantAttributes);
			var added = merchantId
				.then(function( merchantId ){
					return merchants.users.add(merchantId, { email: 'two@example.com' });
				});

			Promise
				.join(merchantId, added)
				.spread(function( merchantId ){
					return merchants.users.find(merchantId);
				})
				.call('limit')
				.call('toArray')
				.tap(function( users ){
					t.equal(users.length, 1, 'count');
					t.ok(users[0].id, 'a primary key is returned');
				});
		});
	});

	t.test('apps', function( t ){
		t.test('add', function( t ){
			t.plan(1);

			merchants
				.create(merchantAttributes)
				.then(function( merchantId ){
					return merchants.apps.add(merchantId, { appId: appId });
				})
				.tap(function( r ){
					t.equal(typeof r, 'undefined', 'returned value');
				})
				.catch(function(){
					t.fail('should not throw');
				});
		});

		t.test('revoke', function( t ){
			t.plan(1);

			var merchantId = merchants.create(merchantAttributes);
			var added = merchantId.then(function( merchantId ){
				return merchants.apps.add(merchantId, { appId: appId });
			});

			Promise
				.join(merchantId, added)
				.spread(function( merchantId ){
					return merchants.apps.revoke(merchantId, appId);
				})
				.tap(function( r ){
					t.equal(typeof r, 'undefined', 'returned value');
				})
				.catch(function(){
					t.fail('should not throw');
				});
		});

		t.test('find', function( t ){
			t.plan(2);

			merchants
				.create(merchantAttributes)
				.then(function( merchantId ){
					return merchants.apps.find(merchantId);
				})
				.call('limit')
				.call('toArray')
				.tap(function( apps ){
					t.equal(apps.length, 1, 'count');
					t.ok(apps[0].id, 'a primary key is returned');
				});
		});
	});

	t.test('lines', function( t ){
		t.test('find', function( t ){
			t.plan(2);

			merchants
				.lines
				.find(merchantId)
				.limit(1)
				.toArray()
				.tap(function( lines ){
					t.equal(lines.length, 1, 'count');
					t.ok(lines[0].id, 'a primary key is returned');
				});
		});
	});

	t.test('transactions', function( t ){
		t.test('create', function( t ){
			t.plan(1)

			merchants
				.transactions
				.create(merchantId, {
					transactionId: transactionId,
					currency: 'EUR',
					amount: 200,
					custom: { source: 'node client test' },
				})
				.then(function( id ){
					t.equal(typeof id, 'string', 'returned primary key');
				})
				.catch(function(){
					t.fail();
				});
		});

		t.test('find', function( t ){
			t.plan(2);

			merchants
				.transactions
				.find(merchantId)
				.limit(3)
				.toArray()
				.tap(function( transactions ){
					t.equal(transactions.length, 3, 'count');
					t.ok(transactions[0].id, 'a primary key is returned');
				});
		});
	});
});

test('transactions', function( t ){
	var merchants = paylike.merchants;
	var transactions = paylike.transactions;

	t.test('find one', function( t ){
		t.plan(2);

		transactions
			.findOne(transactionId)
			.then(function( transaction ){
				t.equal(transaction.id, transactionId, 'primary key');
				t.ok(Array.isArray(transaction.trail), 'trail is an array');
			});
	});

	t.test('capture', function( t ){
		t.plan(6);

		var newTransactionId = merchants.transactions.create(merchantId, {
			transactionId: transactionId,
			currency: 'EUR',
			amount: 300,
			custom: { source: 'node client test' },
		});

		var capture = newTransactionId
			.then(function( transactionId ){
				return transactions.capture(transactionId, {
					currency: 'EUR',
					amount: 100,
				});
			})
			.tap(function( r ){
				t.equal(typeof r, 'undefined', 'returned value');
			})
			.catch(function(){
				t.fail();
			});

		Promise
			.join(newTransactionId, capture)
			.spread(function( transactionId ){
				return transactions.findOne(transactionId);
			})
			.then(function( transaction ){
				t.equal(transaction.capturedAmount, 100, 'captured amount');
				t.equal(transaction.pendingAmount, 200, 'pending amount');
				t.equal(transaction.trail.length, 1, 'length of trail');
				t.equal(transaction.trail[0].capture, true, 'type of trail');
				t.equal(transaction.trail[0].amount, 100, 'amount in capture trail');
			});
	});

	t.test('refund', function( t ){
		t.plan(7);

		var newTransactionId = merchants.transactions.create(merchantId, {
			transactionId: transactionId,
			currency: 'EUR',
			amount: 300,
			custom: { source: 'node client test' },
		});

		var capture = newTransactionId
			.then(function( transactionId ){
				return transactions.capture(transactionId, {
					currency: 'EUR',
					amount: 200,
				});
			});

		var refund = Promise
			.join(newTransactionId, capture)
			.spread(function( transactionId ){
				return transactions.refund(transactionId, {
					amount: 120,
				});
			})
			.tap(function( r ){
				t.equal(typeof r, 'undefined', 'returned value');
			})
			.catch(function(){
				t.fail();
			});

		Promise
			.join(newTransactionId, refund)
			.spread(function( transactionId ){
				return transactions.findOne(transactionId);
			})
			.then(function( transaction ){
				t.equal(transaction.capturedAmount, 200, 'captured amount');
				t.equal(transaction.pendingAmount, 100, 'pending amount');
				t.equal(transaction.refundedAmount, 120, 'refunded amount');
				t.equal(transaction.trail.length, 2, 'length of trail');
				t.equal(transaction.trail[1].refund, true, 'type of trail');
				t.equal(transaction.trail[1].amount, 120, 'amount in refund trail');
			});
	});

	t.test('void', function( t ){
		t.plan(6);

		var newTransactionId = merchants.transactions.create(merchantId, {
			transactionId: transactionId,
			currency: 'EUR',
			amount: 300,
			custom: { source: 'node client test' },
		});

		var voids = newTransactionId
			.then(function( transactionId ){
				return transactions.void(transactionId, {
					amount: 260,
				});
			})
			.tap(function( r ){
				t.equal(typeof r, 'undefined', 'returned value');
			})
			.catch(function(){
				t.fail();
			});

		Promise
			.join(newTransactionId, voids)
			.spread(function( transactionId ){
				return transactions.findOne(transactionId);
			})
			.then(function( transaction ){
				t.equal(transaction.voidedAmount, 260, 'voided amount');
				t.equal(transaction.pendingAmount, 40, 'pending amount');
				t.equal(transaction.trail.length, 1, 'length of trail');
				t.equal(transaction.trail[0].void, true, 'type of trail');
				t.equal(transaction.trail[0].amount, 260, 'amount in refund trail');
			});
	});
});

test('cards', function( t ){
	var cards = paylike.cards;

	t.test('create', function( t ){
		t.plan(1);

		cards
			.create(merchantId, {
				transactionId: transactionId,
			})
			.then(function( id ){
				t.equal(typeof id, 'string', 'returned primary key');
			})
			.catch(function(){
				t.fail();
			});
	});

	t.test('find one', function( t ){
		t.plan(1);

		var cardId = cards.create(merchantId, {
			transactionId: transactionId,
		});

		var fetched = cardId
			.then(function( id ){
				return cards.findOne(id);
			});

		Promise
			.join(cardId, fetched)
			.spread(function( id, fetched ){
				t.deepEqual(fetched, {
					id: id,
					merchantId: '55006bdfe0308c4cbfdbd0e1',
					bin: '410000',
					last4: '0000',
					scheme: 'visa',
					expiry: '2066-08-31T23:59:59.999Z',
					notes: null,
					deleted: null,
				}, 'returned card');
			})
			.catch(function(){
				t.fail();
			});
	});
});
