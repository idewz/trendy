var Hapi    = require('hapi');
var Indexer = require('./indexer');
var Joi     = require('joi');
var Sitemap = require('./sitemap');

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

server.start(function() {
  console.log('server is running at: ' + server.info.uri);
});

module.exports = server;
