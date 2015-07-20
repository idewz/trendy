var _       = require('lodash');
var moment  = require('moment');
var redis   = require('redis');
var request = require('request');
var Q       = require('q');

function Counter() {
  this.time_range = 86400;
}

Counter.prototype.fetch = function() {
  var deferred = Q.defer();
  var client   = redis.createClient();

  var now  = moment().unix();
  var from = now - this.time_range;
  console.log('fetch urls_log starting from', from, 'to', now);

  client.zrangebyscore('urls_log', from, now, function(err, urls) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(urls);
    }
  });

  return deferred.promise;
};

Counter.prototype.fetch_facebook = function(urls) {
  var limit = 50;
  var endpoint = 'https://graph.facebook.com/?access_token=' + process.env.FACEBOOK_TOKEN + '&ids=';

  _.forEach(_.chunk(urls, limit), function(list) {
    var counting = function() {
      var url = [
        endpoint,
        list.join()
      ];
      var options = {
        url: url.join('')
      };

      request.get(options, function(err, res, body) {
        console.log('fetched ' + url.join(''));

        if (err) {
          console.error(err);
        } else if (res.statusCode !== 200) {
          console.error(body);
        } else {
          var objects   = JSON.parse(body);
          var client    = redis.createClient();
          var timestamp = moment().unix();

          _.forEach(objects, function(obj) {
            var url = obj.og_object.url;
            var share_count = obj.share.share_count;
            client.zadd('fetch_log', 'NX', timestamp, url, redis.print);
            // client.zadd('rank', share_count, url, redis.print);
            client.hset(url, 'title', obj.og_object.title, redis.print);
            client.hset(url, 'counts', share_count, redis.print);
          });
        }
      });
    };
    setTimeout(counting, 5000);
  });

  return true;
};

Counter.prototype.rank = function(urls) {
  var deferred = Q.defer();
  var client   = redis.createClient();
  var list     = [];

  _.forEach(urls, function(url) {
    client.hmget(url, 'title', 'counts', function(err, replies) {
      list.push({
        url: url,
        title: replies[0],
        share_count: parseInt(replies[1]) ||  0
      });
      if (list.length == urls.length) {
        deferred.resolve(_.sortByOrder(list, 'share_count', 'desc'));
      }
    });
  });

  return deferred.promise;
};

module.exports = Counter;
