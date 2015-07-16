var Counter = require('./counter');
var Hapi    = require('hapi');
var Indexer = require('./indexer');
var Joi     = require('joi');
var Sitemap = require('./sitemap');

var counter = new Counter();
var indexer = new Indexer();
var sitemap = new Sitemap();
var server  = new Hapi.Server();

server.connection({
  port: 3000
});

server.route({
  method: 'GET',
  path: '/add/{url}',
  handler: function(request, reply) {
    sitemap.fetch(request.params.url)
      .then(sitemap.getUrls)
      .then(indexer.add)
      .then(reply)
      .catch(reply);
  },
  config: {
    validate: {
      params: {
        url: Joi.string().regex(/^[a-z\d-]+\.[a-z\.]{2,6}/)
      }
    }
  }
});

server.route({
  method: 'GET',
  path: '/fetch',
  handler: function(request, reply) {
    counter.fetch()
      .then(counter.fetch_facebook)
      .then(reply);
  }
});

server.route({
  method: 'GET',
  path: '/rank',
  handler: function(request, reply) {
    counter.fetch()
      .then(counter.rank)
      .then(reply);
  }
});

server.start(function() {
  console.log('server is running at: ' + server.info.uri);
});

module.exports = server;
