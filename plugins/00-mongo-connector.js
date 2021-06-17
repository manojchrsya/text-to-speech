const fp = require('fastify-plugin');
const MODELS = require('../models/index.js');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

// eslint-disable-next-line no-unused-vars
module.exports = fp(async (fastify, opts) => {
  const config = {
    uri: process.env.MONGO_URI,
    settings: {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      config: {
        autoIndex: true,
      },
      dbName: 'text-to-speech',
    },
    models: MODELS,
    useNameAndAlias: true,
  };
  fastify.register(require('fastify-mongoose-driver').plugin, config);
});
