var _       = require('lodash');
var moment  = require('moment');
var request = require('request');

fetch = function(url) {
  request('http://localhost:3000/sitemap/add?url=' + url, function(err, res, body) {
    if (err) {
      console.error(moment().toISOString(), err);
    } else {
      console.log(moment().toISOString(), body);
    }
  });
};

urls = [
  'http://www.cnet.com/sitemaps/news.xml',
  'http://gizmodo.com/sitemap_news.xml',
  'http://mashable.com/sitemap-news.xmlo',
  'http://www.techradar.com/sitemap1.xml',
  'http://thenextweb.com/news-sitemap.xml',
  'http://www.theverge.com/sitemap.xml',
  'http://www.wired.com/news-sitemap.xml'
];
// http://arstechnica.com/sitemap-pt-post-2015-07.xml
// http://techcrunch.com/sitemap.xml?yyyy=2015&mm=07&dd=16
// http://www.engadget.com/sitemap_index.xml

_.forEach(urls, function(url) {
  fetch(url);
});
