var Stripe = require('stripe');
var config = require('./config');

module.exports = function (wagner) {
  var stripe = Stripe(config.api.stripe.apiKey);

  wagner.factory('Stripe', function () {
    return stripe;
  });

  return {
    Stripe: stripe
  };
};
