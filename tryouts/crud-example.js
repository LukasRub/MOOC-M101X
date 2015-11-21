var _ = require("underscore");
var mongodb = require("mongodb");

// _.each([1, 2, 3], function(v) {
//   console.log(v);
// })

var uri = 'mongodb://localhost:27017/example';
// mongodb.MongoClient.connect(uri, function(error, db) {
//   if (error) {
//     console.log(error);
//     process.exit(1);
//   }
//
//   db.collection('sample').insert({ x : 1}, function(error, result) {
//     if (error) {
//       console.log(error);
//       process.exit(1);
//     }
//
//     db.collection('sample').find().toArray(function(error, docs){
//       if (error) {
//         console.log(error);
//         process.exit(1);
//       }
//
//       console.log('Found docs:');
//       _.each(docs, function(d){
//         console.log(JSON.stringify(d));
//       });
//       process.exit(0);
//     });
//   });
// });

mongodb.MongoClient.connect(uri, function(error, db) {
  if (error) {
    console.log(error);
    process.exit(1);
  }

  var doc = {
    title: 'Jaws',
    year: 1975,
    director: 'Steven Spielberg',
    rating: 'PG',
    ratings: {
      critics: 80,
      audience: 97
    }
  };


  db.collection('movies').insert(doc, function (error, result) {
    if (error) {
      console.log(error);
      process.exit(1);
    }

    var query = { year: 1975, 'ratings.audience': {'$gte': 97} };
    db.collection('movies').find(query).toArray(function(error, docs) {
      if (error) {
        console.log(error);
        process.exit(1);
      }

      console.log('Found docs:');
      _.each(docs, function (d) {
        console.log(JSON.stringify(d));
      });
      process.exit(0);
    });
  });
});
