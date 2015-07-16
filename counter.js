var redis = require('redis');
var Q     = require('q');

function Counter() {
}

Counter.prototype.fetch = function() {
  var deferred = Q.defer();
  var client   = redis.createClient();

  var now  = Math.floor(new Date() / 1000);
  var from = now - (60 * 60);
  console.log('fetch urls_log starting from', from, ' to ', now);

  client.zrangebyscore('urls_log', from, now, function(err, urls) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(urls);
    }
  });

  return deferred.promise;
};

module.exports = Counter;
