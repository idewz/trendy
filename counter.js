var _       = require('lodash');
var db      = require('./db');
var moment  = require('moment');
var request = require('request');
var Q       = require('q');
var utf8    = require('utf8');

function Counter() {
  this.time_range = 86400;
}

set_shares_history = function(url, hours_diff, share_count) {
  db.redis.hget(url, 'counts', function(err, reply) {
    var shares_diff;
    if (err) {
      shares_diff = 0;
    } else if (reply) {
      shares_diff = share_count - reply;
    }
    db.redis.hset('history:' + url, hours_diff, shares_diff, db.redis.print);
  });
};

Counter.prototype.fetch = function() {
  var deferred = Q.defer();

  var now  = moment().unix();
  var from = now - this.time_range;
  console.log('fetch urls_log starting from', from, 'to', now);

  db.redis.zrangebyscore('urls_log', from, now, 'WITHSCORES', function(err, urls) {
    if (err) {
      deferred.reject(err);
    } else {
      var urls_and_times = _.partition(urls, function(str) { return Number.isNaN(parseInt(str, 10)); });
      deferred.resolve(urls_and_times);
    }
  });

  return deferred.promise;
};

Counter.prototype.fetch_facebook = function(urls_and_times) {
  var limit = 50;
  var endpoint = 'https://graph.facebook.com/?access_token=' + process.env.FACEBOOK_TOKEN + '&ids=';
  var urls  = urls_and_times[0];
  var times = urls_and_times[1];

  _.forEach(_.chunk(urls, limit), function(item) {
    var counting = function() {
      var url = [
        endpoint,
        item.join(',')
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
          var timestamp = moment();
          var og_url;
          var share_count;
          var title;

          _.forEach(objects, function(obj) {
            if (_.has(obj.og_object, 'url')) {
              og_url = obj.og_object.url || obj.id;
              share_count = obj.share.share_count;
              title = obj.og_object.title || og_url;
            } else if (_.has(obj, 'id')) {
              og_url = obj.id;
              share_count = obj.share.share_count;
              title = obj.id;
            } else {
              return;
            }

            db.redis.zadd('fetch_log', 'NX', timestamp.unix(), og_url, db.print);
            // db.redis.zadd('rank', share_count, url, db.print);
            db.redis.hset(og_url, 'title', title, db.print);
            db.redis.hset(og_url, 'counts', share_count, db.print);

            // set url share_count history by hours diff
            var urls_with_time = _.object(urls, times);
            if (_.isUndefined(urls_with_time[og_url])) {
              console.log('can\'t find logged time for ' + og_url);
              return;
            }
            var logged_time = moment(urls_with_time[og_url] * 1000);
            var time_diff   = timestamp.diff(logged_time, 'hours');

            set_shares_history(og_url, time_diff, share_count);
          });
        }
      });
    };
    setTimeout(counting, 5000);
  });

  return true;
};

Counter.prototype.rank = function(urls_and_times) {
  var deferred = Q.defer();
  var list     = [];

  _.forEach(urls_and_times[0], function(url) {
    db.redis.hmget(url, 'title', 'counts', function(err, replies) {
      list.push({
        url: url,
        title: replies[0],
        share_count: parseInt(replies[1]) ||  0
      });
      if (list.length == urls_and_times[0].length) {
        deferred.resolve(_.sortByOrder(list, 'share_count', 'desc'));
      }
    });
  });

  return deferred.promise;
};

module.exports = Counter;
