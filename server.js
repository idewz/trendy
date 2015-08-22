var Counter = require('./counter');
var Feed    = require('./Feed');
var Hapi    = require('hapi');
var Indexer = require('./indexer');
var Joi     = require('joi');

var counter = new Counter();
var indexer = new Indexer();
var feed    = new Feed();
var server  = new Hapi.Server();

server.connection({
  port: 3000
});

var io = require('socket.io')(server.listener);

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
  path: '/{type}/add',
  handler: function(request, reply) {
    if (request.params.type === 'rss') {
      feed.fetch(request.query.url)
        .then(feed.get_rss)
        .then(indexer.add)
        .then(reply)
        .catch(reply);
    } else if (request.params.type === 'sitemap') {
      feed.fetch(request.query.url)
        .then(feed.get_sitemap)
        .then(indexer.add)
        .then(reply)
        .catch(reply);
    }
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
      .then(function() {
        counter.fetch()
          .then(counter.rank)
          .then(function(urls) {
            io.emit('io:rank', urls);
          });
      });
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
  path: '/history',
  handler: function(request, reply) {
    indexer.get_history()
      .then(indexer.group_history)
      .then(reply)
      .catch(reply);
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
