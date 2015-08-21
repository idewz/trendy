var _  = require('lodash');
var db = require('./db');

function Indexer() {
}

Indexer.prototype.add = function(urls) {
  var client = db.redis;

  // urls - list of urls we know. we don't want to add it twice
  // urls_log - list of urls by timestamp, so we can list urls by time range
  _.forEach(urls, function(url) {
    client.sadd('urls', url.location, function(err, reply) {
      // if it is new add to urls_log
      if (reply) {
        client.zadd('urls_log', 'NX', url.datetime, url.location, client.print);
        // wanna set expire time?
      }
    });
  });

  return urls.length;
};

module.exports = Indexer;
