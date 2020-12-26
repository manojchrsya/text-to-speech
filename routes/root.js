
const IndexController = require('../controllers');
const Upload = require('../lib/Upload');

module.exports = async function (fastify, opts) {
  const indexController = new IndexController();
  const uploadInstance = new Upload();
  fastify.decorateRequest('tesseractText', '');

  fastify.get('/', opts, indexController.home);

  fastify.post('/upload', { preHandler: uploadInstance.upload.single('file') }, indexController.upload);
  fastify.get('/upload', indexController.redirect);

  fastify.get('/download', indexController.download);

}
