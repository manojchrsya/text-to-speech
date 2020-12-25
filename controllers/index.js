

const COUNT_PER_PAGE = 9
const Tesseract = require('../lib/Tesseract');

const tesseract = new Tesseract();

class IndexController {

  async home (request, reply) {
    const promise = [];
    const page = {};
    page.pageNo = (request.query && request.query.pageNo) || 1;
    const total = await Story.countDocuments();
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
  }

  async upload (request, reply) {
    // load tesseract
    await tesseract.init();
    const { data: { text } } = await tesseract.recognize(request.file);
    return reply.redirect('/');
  }

}

module.exports = IndexController
