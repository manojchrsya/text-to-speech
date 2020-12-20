// Require the framework
const Fastify = require('fastify');
const fs = require('fs');
const path = require('path')
require('dotenv').config();

class Base {
  constructor () {
    this.app = new Fastify({ logger: true, pluginTimeout: 10000 });
    this.app.register(require('../plugins/mongo-connector.js'));
  }

  getFileContent(filePath) {
    const file = path.join(__dirname, filePath);
    if (!fs.existsSync(file)) {
      throw new Error('File not exist in path');
    }
    return new Promise((resolve) => {
      let data = '';
      const stream = fs.createReadStream(file);
      stream.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        resolve(data);
      });
    });
  }

  exit () {
    process.exit(-1);
  }

}

module.exports = Base;
