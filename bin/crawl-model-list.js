const cheerio = require('cheerio');
const Promise = require('bluebird');
const Crawler = require('./crawler');

const ITEMS_PER_PAGE = 32;

class CrawlModelList extends Crawler {
  constructor() {
    super();
    this.init();
  }

  async init() {
    await this.app.ready();
    const models = await this.app.mongoose.VehicleModel.find({ parsed: false });
    await Promise.mapSeries(models, async (model) => {
      await this.createPartList(model);
      // eslint-disable-next-line no-param-reassign
      model.parsed = true;
      model.save();
      return true;
    });
    // eslint-disable-next-line no-console
    console.log('Bajaj models part imported in db');
    this.exit();
  }

  // eslint-disable-next-line class-methods-use-this
  async createPartList(model) {
    const urls = [];
    const pages = Math.ceil(model.count / ITEMS_PER_PAGE);
    let start = 1;
    while (start <= pages) {
      urls.push(`${model.link}&p=${start}`);
      start += 1;
    }

    await Promise.mapSeries(urls, async (url) => {
      const productList = await this.getPageLinks(url, model.title);
      if (productList.length > 0) {
        await this.app.mongoose.PartList.create(productList);
      }
      return true;
    });
    return true;
  }

  async getPageLinks(link, modelName) {
    const parts = [];
    const response = await this.parseUrl(link);
    const $ = cheerio.load(response);
    // const reg = /(.*)?\s\s+\(\d+\)/;
    $(response).find('ul.products-grid li').map((index, element) => {
      const url = $(element).find('a.product-image').attr('href');
      parts.push({
        make: 'Bajaj',
        model: modelName,
        title: $(element).find('h2.product-name a').text(),
        description: $(element).find('a.product-image').attr('title'),
        link: url,
        parsed: false,
      });
      return true;
    });
    return parts;
  }
}

// eslint-disable-next-line no-new
new CrawlModelList();
