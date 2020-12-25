const path = require('path');
const { createWorker } = require('tesseract.js');

class Tesseract {
  constructor () {
    this.worker = createWorker({
      logger: m => console.log(m)
    });
  }

  async init () {
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    return true;
  }

  async recognize (file) {
    const filePath = path.join(__dirname, '../' ,file.path);
    const data = await this.worker.recognize(filePath);
    return data;
  }
}

module.exports = Tesseract;
