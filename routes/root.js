'use strict'
const COUNT_PER_PAGE = 9

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const promise = [];
    const page = {};
    page.pageNo = (request.query && request.query.pageNo) || 1;
    const total = await Story.count();
    const totalPage = Math.ceil(total / COUNT_PER_PAGE);
    page.total = totalPage;
    const skip = (COUNT_PER_PAGE * (parseInt(page.pageNo) - 1));
    const limit = COUNT_PER_PAGE;
    promise.push(Story.find().skip(skip).limit(limit));
    if (request.query && request.query.storyId) {
      promise.push(Story.findById(request.query.storyId));
    }
    const [stories = [], selected = {}] = await Promise.all(promise);
    return reply.view('image-to-speech.ejs', { stories, selected, page });
  })
}
