var mongoose = require('mongoose');
var productsSchema = require('./schemas/product').productsSchema;

mongoose.connect('mongodb://localhost:27017/test');

var Product = mongoose.model('Product', productsSchema, 'products');

var p = new Product({
  name: 'test',
  price: {
    amount: 5,
    currency: 'USD'
  },
  category: {
    name: 'test'
  }
});

console.log(p.internal.approximatePriceUSD);

p.price.amount = 88;
console.log(p.internal.approximatePriceUSD);

p.price.currency = 'EUR';
console.log(p.internal.approximatePriceUSD);

p.price.amount = 11;
console.log(p.internal.approximatePriceUSD);

process.exit(0);

// var schema = require('./schemas/schema');
//
// mongoose.connect('mongodb://localhost:27017/test');
//
// var User = mongoose.model('User', schema, 'users');
//
// var user = new User({
//   name: 'John Smith',
//   email: 'john@smith.io'
// });
//
// user.save(function (error) {
//   if (error) {
//     console.error(error);
//     process.exit(1);
//   }
//   var query = {
//     email: 'john@smith.io'
//   }
//   User.find(query, function (error, docs) {
//     if (error) {
//       console.error(error);
//     }
//     console.log(require('util').inspect(docs, { depth: null }));
//     process.exit(0);
//   });
// });
