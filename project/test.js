var express = require('express');
var assert = require('assert');
var superagent = require('superagent');
var wagner = require('wagner-core');

var URL_ROOT = 'http://localhost:3000';

describe('Category API', function () {
  var server;
  var Category;
  var Product;

  before(function () {
    var app = express();

    // Bootstrap server
    var models = require('./models')(wagner);
    app.use(require('./api')(wagner));

    server = app.listen(3000);

    // Make Category model available in tests
    Category = models.Category;
    Product = models.Product;
  });

  after(function () {
    //Shut the server down when we're done
    server.close();
  });

  beforeEach(function (done) {
    // Make sure categories are empty before eacg test
    Category.remove({}, function(err){
      assert.ifError(err);
      Product.remove({}, function(err){
        assert.ifError(err);
        done();
      });
    });
  });

  it('can load a category by id', function (done) {
    // Create a single category
    Category.create({_id: 'Electronics'}, function (err, doc) {
      assert.ifError(err);
      var url = URL_ROOT + '/category/id/Electronics';
      // Make a HTTP request to localhost:3000/category/id/Electronics
      superagent.get(url, function (err, res) {
        assert.ifError(err);
        var result;
        // And make sure we got {_id: 'Electronics'} back
        assert.doesNotThrow(function () {
          result = JSON.parse(res.text);
        });
        assert.ok(result.category);
        assert.equal(result.category._id, 'Electronics');
        done();
      });
    });
  });

  it('can load all categories that have a certain parent', function (done) {
    var categories = [
      {_id: 'Electronics'},
      {_id: 'Phones', parent: 'Electronics'},
      {_id: 'Laptops', parent: 'Electronics'},
      {_id: 'Bacon'}
    ];

    // Create 4 categories
    Category.create(categories, function (err, categories) {
      var url = URL_ROOT + '/category/parent/Electronics';
      // Make an HTTP request to localhost:3000/category/parent/Electronics
      superagent.get(url, function (err, res) {
        assert.ifError(err);
        var result;
        assert.doesNotThrow(function () {
          result = JSON.parse(res.text);
        });
        assert.equal(result.categories.length, 2);
        // Should be in ascending order by _id
        assert.equal(result.categories[0]._id, 'Laptops');
        assert.equal(result.categories[1]._id, 'Phones');
        done();
      });
    });
  });

  it('can load a product by id', function(done) {
    // Create a single product
    var PRODUCT_ID = '000000000000000000000001';
    var product = {
      name: 'LG G4',
      _id: PRODUCT_ID,
      price: {
        amount: 300,
        currency: 'USD'
      }
    };
    Product.create(product, function (err, doc) {
      assert.ifError(err);
      var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
      // Make a HTTP request to localhost:3000/product/id/0000000000000001
      superagent.get(url, function (err, res) {
        assert.ifError(err);
        var result;
        // And make sure we got the LG G4 back
        assert.doesNotThrow(function () {
          result = JSON.parse(res.text);
        });
        assert.ok(result);
        assert.equal(result.product._id, PRODUCT_ID);
        assert.equal(result.product.name, 'LG G4');
        done();
      });
    });
  });

  it('can load all products in a category with sub-categories', function (done) {
    var categories = [
      {_id: 'Electronics'},
      {_id: 'Phones', parent: 'Electronics'},
      {_id: 'Laptops', parent: 'Electronics'},
      {_id: 'Bacon'}
    ];

    var products = [
      {
        name: 'LG G4',
        category: {_id: 'Phones', ancestors: ['Electronics', 'Phones']},
        price: {amount: 300, currency: 'USD'}
      },
      {
        name: 'ASUS Zenbook Prime',
        category: {_id: 'Laptops', ancestors: ['Electronics', 'Laptops']},
        price: {amount: 2000, currency: 'USD'}
      },
      {
        name: 'Flying Pigs Farm Pasture Raised Pork Bacon',
        category: {_id: 'Bacon', ancestors: ['Bacon']},
        price: {amount: 20, currency: 'USD'}
      }
    ];

    // Create 4 categories
    Category.create(categories, function(err, categories) {
      assert.ifError(err);
      // And 3 products
      Product.create(products, function(err, products) {
        assert.ifError(err);
        var url = URL_ROOT + '/product/category/Electronics';
        // Make an HTTP request to localhost:3000/product/category/Electronics
        superagent.get(url, function (err, res) {
          assert.ifError(err);
          var result;
          assert.doesNotThrow(function () {
            result = JSON.parse(res.text);
          });
          assert.equal(result.products.length, 2);
          // Should be in ascending order by name
          assert.equal(result.products[0].name, 'ASUS Zenbook Prime');
          assert.equal(result.products[1].name, 'LG G4');

          // Sort by price, ascending
          var url = URL_ROOT + '/product/category/Electronics?price=1';
          superagent.get(url, function (err, res) {
            assert.ifError(err);
            var result;
            assert.doesNotThrow(function () {
              result = JSON.parse(res.text);
            });
            assert.equal(result.products.length, 2);
            // Should be in ascending order by price
            assert.equal(result.products[0].name, 'LG G4');
            assert.equal(result.products[1].name, 'ASUS Zenbook Prime');
            done();
          });
        });
      });
    });
  });

});
