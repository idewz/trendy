var _ = require('lodash');
var Q = require('q');
var moment  = require('moment');
var request = require('request');
var URL     = require('url');
var xml2js  = require('xml2js');

function Sitemap() {
}

Sitemap.prototype.fetch = function(url) {
  var deferred = Q.defer();

  var options = {
    url: url
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

Sitemap.prototype.getUrls = function(xml_string) {
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

module.exports = Sitemap;
