const fp = require('fastify-plugin');
const Promise = require('bluebird');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

// eslint-disable-next-line no-unused-vars
module.exports = fp(async (fastify, opts) => {
  global.Promise = Promise;
  const { mongoose } = fastify;
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(mongoose.instance.models)) {
    global[key] = value;
  }

  // adding pre handler for locals
  fastify.addHook('preHandler', (req, reply, next) => {
    // eslint-disable-next-line no-param-reassign
    reply.locals = reply.locals || {};
    // eslint-disable-next-line no-param-reassign
    reply.locals.url = process.env.BASE_URL;
    // eslint-disable-next-line no-param-reassign
    reply.locals.errors = [];
    next();
  });
  return Promise.resolve();
});
