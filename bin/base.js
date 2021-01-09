// Require the framework
const Fastify = require('fastify');
const fp = require('fastify-plugin');
const path = require('path');
const fs = require('fs');
const app = require('../app');

class Base {
  constructor() {
    const fastify = new Fastify({ logger: true, pluginTimeout: 10000 });
    this.app = fastify.register(fp(app), {});
  }

  // eslint-disable-next-line class-methods-use-this
  getFileContent(filePath) {
    const file = path.join(__dirname, filePath);
    if (!fs.existsSync(file)) {
      throw new Error('File not exist in path');
    }
    return new Promise((resolve) => {
      let data = '';
      const stream = fs.createReadStream(file);
      stream.on('data', (chunk) => {
        data += chunk;
      }).on('end', () => {
        resolve(data);
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  exit() {
    process.exit(-1);
  }
}

module.exports = Base;
