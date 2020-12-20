'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const promise = [];
    promise.push(Story.find().skip(0).limit(9));
    if (request.query && request.query.storyId) {
      promise.push(Story.findById(request.query.storyId));
    }
    const [stories = [], selected = {}] = await Promise.all(promise);
    return reply.view('image-to-speech.ejs', { stories, selected });
  })
}
