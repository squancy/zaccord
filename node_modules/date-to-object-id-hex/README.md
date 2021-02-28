# date-to-object-id-hex

Convert a Date object to a MongoDB ObjectId hex string.

This is useful for searching documents in a MongoDb collection by creation
date without having a dedicated field and index to do so.

This package does not have any dependencies and is just a few lines of code
(in contrast to `mongodb`) making it perfect for the frontend, e.g. when
dealing with APIs using Object Ids for pagination.

## Examples

```js
var toHex = require('date-to-object-id-hex');

var hex = toHex(new Date('2016-01-01'));	// 5685c1800000000000000000

// in Node.js, find all documents since 2016
collection.find({ _id: { $gt: ObjectId(hex) } });
```
