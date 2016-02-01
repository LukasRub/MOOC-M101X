var express = require('express');
var httpstatus = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');

module.exports = function (wagner) {
  var api = express.Router();

  api.use(bodyparser.json());

  api.put('/me/cart', wagner.invoke(function (User) {
    return function (req, res) {
      try {
        var cart = req.body.data.cart;
      } catch (e) {
        return res.status(httpstatus.BAD_REQUEST)
          .json({error: 'No cart specified!'});
      }
      req.user.data.cart = cart;
      req.user.save(function (err, user) {
        if (err) {
          return res.status(httpstatus.INTERNAL_SERVER_ERROR)
            .json({error: err.toString()});
        }
        return res.json({user: user});
      });
    }
  }));

  api.get('/me', function (req, res) {
    if (!req.user) {
      return res.status(httpstatus.UNAUTHORIZED).json({error: 'Not logged in'});
    }

    req.user.populate({path: 'data.cart.product', model: 'Product'},
      handleOne.bind(null, 'user', res));
  });

  api.get('/product/id/:id', wagner.invoke(function (Product) {
    return function (req, res) {
      Product.findOne({_id: req.params.id},
        handleOne.bind(null, 'product', res));
    };
  }));

  api.get('/product/category/:id', wagner.invoke(function (Product) {
    return function (req, res) {
      var sort = {name: 1};
      if (req.query.price == "1") {
        sort = {'internal.approximatePriceUSD': 1};
      } else if (req.query.price == "-1") {
        sort = {'internal.approximatePriceUSD': -1};
      }
      Product.find({'category.ancestors': req.params.id}).sort(sort)
        .exec(handleMany.bind(null, 'products', res));
    };
  }));

  api.get('/category/id/:id', wagner.invoke(function (Category) {
    return function (req, res) {
      Category.findOne({_id: req.params.id},
        handleOne.bind(null, 'category', res));
    };
  }));

  api.get('/category/parent/:id', wagner.invoke(function (Category) {
    return function (req, res) {
      Category.find({parent: req.params.id}).sort({_id : 1})
        .exec(handleMany.bind(null, 'categories', res));
    };
  }));

  api.post('/checkout', wagner.invoke(function (User, Stripe) {
    return function (req, res) {
      if (!req.user) {
        return res.status(httpstatus.UNAUTHORIZED)
          .json({error: 'Not logged in'});
      }
      // Populate the products in the user's cart
      req.user.populate({path: 'data.cart.product', model: 'Product'},
        function (err, user) {
          // Sum up the total price in USD
          var totalCostUSD = 0;
          _.each(user.data.cart, function (item) {
            totalCostUSD += item.product.internal.approximatePriceUSD *
              item.quantity;
          });
          // And create a charge in Stripe corresponding to the price
          Stripe.charges.create({
            // Stripe wants price in cents, so multiply by 100 and round up
            amount: Math.ceil(totalCostUSD * 100),
            currency: 'usd',
            source: req.body.stripeToken,
            description: 'Example charge'
          },
          function (err, charge) {
            if (err && err.type === 'StripeCardError') {
              return res.status(httpstatus.BAD_REQUEST)
                .json({error: err.toString()});
            }
            if (err) {
              console.log(err);
              return res.status(httpstatus.INTERNAL_SERVER_ERROR)
                .json({error: err.toString()});
            }

            req.user.data.cart = [];
            req.user.save(function () {
              return res.json({id: charge.id});
            });
          });
        });

    }
  }));

  return api;
};

function handleOne(property, res, err, result) {
  if (err) {
    return res.status(httpstatus.INTERNAL_SERVER_ERROR).
      json({error: err.toString()});
  }
  if (!result) {
    return res.status(httpstatus.NOT_FOUND).json({error: 'Not found'});
  }
  var json = {};
  json[property] = result;
  res.json(json);
};

function handleMany(property, res, err, result) {
  if (err) {
    return res.status(httpstatus.INTERNAL_SERVER_ERROR).
      json({error: err.toString()});
  }
  var json = {};
  json[property] = result;
  res.json(json);
};
