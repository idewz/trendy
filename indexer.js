var _     = require('lodash');
var redis = require('redis');

function Indexer() {
}

Indexer.prototype.add = function(urls) {
  var client = redis.createClient();

  // urls - list of urls we know. we don't want to add it twice
  // urls_log - list of urls by timestamp, so we can list urls by time range
  _.forEach(urls, function(url) {
    client.sadd('urls', url, function(err, reply) {
      // if it is new add to urls_log
      if (reply) {
        var timestamp = Math.floor(new Date() / 1000);
        client.zadd('urls_log', 'NX', timestamp, url, redis.print);
        // wanna set expire time?
      }
    });
  });

  return urls.length;
};

module.exports = Indexer;
