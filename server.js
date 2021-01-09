// Require the framework
const Fastify = require('fastify');
const fp = require('fastify-plugin');
const FastifyConsole = require('./lib/Console');

const fastifyconsole = new FastifyConsole();

// Instantiate Fastify with some config
const app = Fastify({ logger: true, pluginTimeout: 1000 });
const App = require('./app');

// Register your application as a normal plugin.
app.register(fp(App), {});

if (fastifyconsole.active()) {
  app.ready((error) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return false;
    }
    return fastifyconsole.start(app, {
      prompt: 'fastify > ',
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
