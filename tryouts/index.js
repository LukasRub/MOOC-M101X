var mongoose = require('mongoose');
var schema = require('./schemas/schema');

mongoose.connect('mongodb://localhost:27017/test');

var User = mongoose.model('User', schema, 'users');

var user = new User({
  name: 'John Smith',
  email: 'john@smith.io'
});

user.save(function (error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  var query = {
    email: 'john@smith.io'
  }
  User.find(query, function (error, docs) {
    if (error) {
      console.error(error);
    }
    console.log(require('util').inspect(docs, { depth: null }));
    process.exit(0);
  });
});
