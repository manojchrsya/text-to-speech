const cheerio = require('cheerio');
const Promise = require('bluebird');
const Crawler = require('./crawler');

class CrawlPartDetail extends Crawler {
  constructor() {
    super();
    this.init();
  }

  async init() {
    await this.app.ready();
    const models = await this.app.mongoose.PartList.find({ parsed: false });
    await Promise.mapSeries(models, async (model) => {
      await this.createPartNumber(model);
      // eslint-disable-next-line no-param-reassign
      model.parsed = true;
      model.save();
      return true;
    });

    // eslint-disable-next-line no-console
    console.log('Bajaj part numbers imported in db');
    this.exit();
  }

  // eslint-disable-next-line class-methods-use-this
  async createPartNumber(data) {
    // eslint-disable-next-line no-unused-vars
    const [partNumbers, meta] = await this.getPageLinks(data);
    if (partNumbers.length > 0) {
      await this.app.mongoose.PartNumber.create(partNumbers);
    }
    // eslint-disable-next-line no-param-reassign
    data.meta = meta;
    await data.save();
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
    return true;
  }

  async getPageLinks(data) {
    const parts = [];
    const response = await this.parseUrl(data.link);
    const $ = cheerio.load(response);
    const reg = /(.*)?\+Rs\..*/;
    $(response).find('#product-options-wrapper dd ul li').map((index, element) => {
      const text = $(element).text().replace(/\s\s+|\n/g, '');
      // eslint-disable-next-line no-unused-vars
      const result = text.split('|');
      const [desc, partNumber] = [result[0], result[result.length - 1]];
      parts.push({
        make: 'Bajaj',
        model: data.model,
        title: data.title,
        original: text && text.trim(),
        description: desc,
        // eslint-disable-next-line max-len
        partNumber: reg.exec(partNumber) && reg.exec(partNumber)[1] && reg.exec(partNumber)[1].trim(),
        // eslint-disable-next-line newline-per-chained-call
        price: $(element).find('span.price').text().replace('Rs.', '').trim(),
      });
      return true;
    });
    const meta = {};
    $(response).find('#product-attribute-specs-table tr').map((index, row) => {
      const key = $(row).find('th').text();
      meta[key] = $(row).find('td').text();
      return true;
    });
    return [parts, meta];
  }
}

// eslint-disable-next-line no-new
new CrawlPartDetail();
