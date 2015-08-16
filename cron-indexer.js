var _       = require('lodash');
var moment  = require('moment');
var request = require('request');

sitemap_fetch = function(url) {
  request('http://localhost:3000/sitemap/add?url=' + url, function(err, res, body) {
    if (err) {
      console.error(moment().toISOString(), err);
    } else {
      console.log(moment().toISOString(), body);
    }
  });
};

rss_fetch = function(url) {
  request('http://localhost:3000/rss/add?url=' + url, function(err, res, body) {
    if (err) {
      console.error(moment().toISOString(), err);
    } else {
      console.log(moment().toISOString(), body);
    }
  });
};

en_sitemap_urls = [
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
th_sitemap_urls = [
  'http://www.thairath.co.th/sitemap-' + moment().format('YYYY-MM-DD') + '.xml'
];

th_rss_urls = [
  'https://www.blognone.com/node/feed',
  'http://droidsans.com/rss.xml',
  'http://www.macthai.com/feed/',
  'http://techsauce.co/feed/',
  'http://feeds.feedburner.com/9tana'
  // 'http://www.khaosod.co.th/rss/urgent_news.xml',
  // 'http://www.khaosod.co.th/rss/wikipedia_news.xml',
  // 'http://www.khaosod.co.th/rss/entertainment_news.xml',
  // 'http://www.khaosod.co.th/rss/sport_news.xml',
  // 'http://www.khaosod.co.th/rss/every-direction_news.xml',
  // 'http://www.manager.co.th/RSS/Home/Breakingnews.xml',
  // 'http://www.posttoday.com/rss/src/breakingnews.xml',
  // 'http://www.matichon.co.th/rss/news_article.xml',
  // 'http://www.matichon.co.th/rss/news_conspicuous.xml',
  // 'http://rssfeeds.sanook.com/rss/feeds/sanook/news.index.xml',
];

_.forEach(th_sitemap_urls, function(url) {
  sitemap_fetch(url);
});

_.forEach(th_rss_urls, function(url) {
  rss_fetch(url);
});
