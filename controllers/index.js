const path = require('path');
const fs = require('fs');
const Tesseract = require('../lib/Tesseract');

const tesseract = new Tesseract();

class IndexController {
  async home(request, reply) {
    const promise = [];
    const { skip, limit, page } = await this.pagination(request, Story);
    promise.push(Story.find().skip(skip).limit(limit));
    if (request.query && request.query.storyId) {
      promise.push(Story.findById(request.query.storyId));
    }
    const [stories = [], selected = {}] = await Promise.all(promise);
    return reply.view('image-to-speech.ejs', { stories, selected, page });
  }

  async upload(request, reply) {
    // load tesseract
    await tesseract.init();
    const { data: { text } } = await tesseract.recognize(request.file);
    // remove upload file after extracting text
    await tesseract.remove(request.file);
    const { skip, limit, page } = await this.pagination(request, Story);
    const stories = await Story.find().skip(skip).limit(limit);
    const selected = { title: '', content: text };
    return reply.view('image-to-speech.ejs', { stories, selected, page });
  }

  // eslint-disable-next-line class-methods-use-this
  download(_request, reply) {
    reply.header('Content-disposition', 'attachment; filename=sample.png');
    const filePath = path.join(__dirname, '../', 'public/uploads/sample.png');
    const content = fs.readFileSync(filePath);
    return reply.send(content);
  }

  // eslint-disable-next-line class-methods-use-this
  redirect(_request, reply) {
    return reply.redirect('/');
  }
}

module.exports = IndexController;
