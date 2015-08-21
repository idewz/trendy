var _ = require('lodash');
var Q = require('q');
var moment  = require('moment');
var request = require('request');
var URL     = require('url');
var xml2js  = require('xml2js');

function Feed() {
}

Feed.prototype.fetch = function(url) {
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

Feed.prototype.get_rss = function(xml_string) {
  try {
    var urls = [];

    xml2js.parseString(xml_string, function(err, xml) {
      _.forEach(xml.rss.channel[0].item, function(url) {
        location = URL.parse(url.link[0]);

        // exclude Feed and frontpage
        if (/rss|feed/.test(location.href) || _.isEmpty(location.path)) {
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

Feed.prototype.get_sitemap = function(xml_string) {
  try {
    var urls = [];

    xml2js.parseString(xml_string, function(err, xml) {
      _.forEach(xml.urlset.url, function(url) {
        location = URL.parse(url.loc[0]);

        // exclude sitemap and frontpage
        if (/sitemap/.test(location.href) || _.isEmpty(location.path)) {
          console.log('exclude', location.href);
          return;
        }

        var field = '';
        var title = '';
        var timestamp = moment();

        if (_.has(url, 'news:news')) {
          field = 'news:news';
          title = url[field][0]['news:title'][0];
          timestamp = url[field][0]['news:publication_date'][0];
        } else if (_.has(url, 'n:news')) {
          field = 'n:news';
          title = url[field][0]['n:title'][0];
          timestamp = url[field][0]['n:publication_date'][0];
        } else {
          timestamp = url.lastmod[0];
        }

        urls.push({
          location: location.href,
          title: title,
          datetime: moment(timestamp).unix()
        });
      });
    });

    return urls;
  }
  catch (ex) {
    console.error('problem parsing sitemap: ' + ex);
  }
};

module.exports = Feed;
