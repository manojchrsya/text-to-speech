'use strict'

const fp = require('fastify-plugin')
const MODELS = require('../models/index.js');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async (fastify, opts) => {
  fastify.register(require("fastify-mongoose-driver").plugin, {
    uri: process.env.MONGO_URI,
    settings: {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      config: {
        autoIndex: true,
      },
      dbName: 'text-to-speech'
    },
    models: MODELS,
    useNameAndAlias: true
  });
});
