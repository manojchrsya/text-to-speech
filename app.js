'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const multer = require('fastify-multer')

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  // Read the .env file.
  require('dotenv').config();
  // 1. set default template enging to render pages
  // 2. server static file from server
  fastify
    .register(require('point-of-view'), { engine: { ejs: require('ejs') }, root: path.join(__dirname, 'views') })
    .register(require('fastify-static'), { root: path.join(__dirname, 'public') })
    .register(require('fastify-formbody'))
    .register(multer.contentParser)
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

}
