'use strict'

const fp = require('fastify-plugin')
const Promise = require('bluebird');
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async (fastify, opts) => {
  global.Promise = Promise;
  const { mongoose } = fastify;
  for (const [key, value] of Object.entries(mongoose.instance.models)) {
    global[key] = value;
  }

  // adding pre handler for locals
  fastify.addHook('preHandler', function (req, reply, next) {
    reply.locals = reply.locals || {};
    reply.locals.url = process.env.BASE_URL;
    reply.locals.errors = [];
    next();
  })
  return Promise.resolve();
})
