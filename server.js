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

server.views({
  engines: {
    jade: {
      module: require('jade')
    }
  },
  relativeTo: __dirname,
  path: 'views',
  helpersPath: 'views/helpers'
});

server.route({
  method: 'GET',
  path: '/sitemap/add',
  handler: function(request, reply) {
    sitemap.fetch(request.query.url)
      .then(sitemap.getUrls)
      .then(indexer.add)
      .then(reply)
      .catch(reply);
  },
  config: {
    validate: {
      query: {
        url: Joi.string().regex(/[-a-zA-Z0-9\:_\/\.]{8,256}/)
      }
    }
  }
});

server.route({
  method: 'GET',
  path: '/stat/count',
  handler: function(request, reply) {
    counter.fetch()
      .then(counter.fetch_facebook)
      .then(reply);
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    counter.fetch()
      .then(counter.rank)
      .then(function(urls) {
        reply.view(
          'index',
          {
            urls: urls
          }
        );
      });
  }
});

server.route({
  method: 'GET',
  path: '/public/{path*}',
  handler: {
    directory: {
      path: 'public',
      listing: false
    }
  }
});

server.start(function() {
  console.log('server is running at: ' + server.info.uri);
});

module.exports = server;
