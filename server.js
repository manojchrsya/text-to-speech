// Require the framework
const Fastify = require('fastify');
const fp = require('fastify-plugin');
// const FConsole = require('./lib/Console');
const FastifyConsole = require('fastify-console');

// Instantiate Fastify with some config
const app = Fastify({ logger: true, pluginTimeout: 4000 });
const App = require('./app');

// Register your application as a normal plugin.
app.register(fp(App), {});

if (FastifyConsole.active()) {
  app.ready((error) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return false;
    }
    return FastifyConsole.start(app, {
      prompt: 'fastify > ',
      historyPath: '.data/history.log',
    });
  });
} else if (require.main === module) {
  // Start listening.
  app.listen(process.env.PORT || 3000, '0.0.0.0', (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}
