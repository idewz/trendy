var _  = require('lodash');
var db = require('./db');
var Q  = require('q');

function Indexer() {
}

Indexer.prototype.add = function(urls) {
  // urls - list of urls we know. we don't want to add it twice
  // urls_log - list of urls by timestamp, so we can list urls by time range
  _.forEach(urls, function(url) {
    db.redis.sadd('urls', url.location, function(err, reply) {
      // if it is new add to urls_log
      if (reply) {
        db.redis.zadd('urls_log', 'NX', url.datetime, url.location, db.print);
        // wanna set expire time?
      }
    });
  });

  return urls.length;
};

Indexer.prototype.get_history = function() {
  var deferred = Q.defer();

  db.redis.keys('history:*', function(err, replies) {
    if (err) {
      console.error(err);
    } else if (replies) {
      return deferred.resolve(replies);
    }
  });

  return deferred.promise;
};

Indexer.prototype.group_history = function(keys) {
  _.forEach(keys, function(key) {
    db.redis.hgetall(key, function(err, replies) {
      var shares_history = _.fill(Array(24), 0);
      if (err) {
        console.error(err);
      } else if (replies) {
        _.forEach(_.keys(replies), function(hour) {
          shares_history[hour] = replies[hour];
        });
        var url = key.substring(8);
        db.redis.hset(url, 'history', shares_history.join(','), db.print);
      }
    });
  });
  return 'history cleaning';
};

module.exports = Indexer;
