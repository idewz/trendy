var redis = require('redis');

exports.redis = redis.createClient();
exports.print = function(err, reply) {
  if (err) {
    console.error(err);
  }
};
