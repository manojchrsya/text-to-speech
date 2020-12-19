'use strict'
module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const stories = await fastify.mongoose.Story.find();
    console.log(stories);
    return reply.view('image-to-speech.ejs');
  })
}
