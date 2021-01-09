const path = require('path');
const fs = require('fs-extra');
const { createWorker } = require('tesseract.js');

class Tesseract {
  constructor() {
    this.worker = createWorker({
      // eslint-disable-next-line no-console
      logger: (m) => console.log(m),
    });
  }

  async init() {
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    return true;
  }

  async recognize(file) {
    const filePath = path.join(__dirname, '../', file.path);
    const data = await this.worker.recognize(filePath);
    return data;
  }

  // eslint-disable-next-line class-methods-use-this
  async remove(file) {
    const filePath = path.join(__dirname, '../', file.path);
    fs.unlinkSync(filePath);
    return true;
  }
}

module.exports = Tesseract;
