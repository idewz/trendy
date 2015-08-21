var _ = require('lodash');
var Q = require('q');
var moment  = require('moment');
var request = require('request');
var URL     = require('url');
var xml2js  = require('xml2js');

function RSS() {
}

RSS.prototype.fetch = function(url) {
  var deferred = Q.defer();

  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36'
    }
  };

  console.log('fetching ' + url);

  request(options, function(err, res, body) {
    if (err) {
      deferred.reject(err);
    } else if (res.statusCode !== 200) {
      deferred.reject(body);
    } else {
      deferred.resolve(body);
    }
  });

  return deferred.promise;
};

RSS.prototype.getUrls = function(xml_string) {
  try {
    var urls = [];

    xml2js.parseString(xml_string, function(err, xml) {
      _.forEach(xml.rss.channel[0].item, function(url) {
        location = URL.parse(url.link[0]);

        // exclude RSS and frontpage
        if (/RSS/.test(location.href) || _.isEmpty(location.path)) {
          console.log('exclude', location.href);
          return;
        }

        var item = {
          location: location.href,
          title: url.title[0],
          datetime: moment(url.pubDate[0]).unix()
        };

        urls.push(item);
      });
    });

    return urls;
  }
  catch (ex) {
    console.error('problem parsing RSS: ' + ex);
  }
};

module.exports = RSS;
