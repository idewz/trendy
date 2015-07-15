var _ = require('lodash');
var Q = require('q');
var request = require('request');
var xml2js  = require('xml2js');

function Sitemap() {
}

Sitemap.prototype.fetch = function(url) {
  var deferred = Q.defer();
  url = 'http://www.' + url + '/sitemap.xml';

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
        if (!/sitemap/.test(url.loc[0])) {
          urls.push(url.loc[0]);
        }
      });
    });

    return urls.join('\n');
  }
  catch (ex) {
    console.error('problem parsing sitemap: ' + ex);
  }
};

module.exports = Sitemap;
