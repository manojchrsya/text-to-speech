const cheerio = require('cheerio');
// const Promise = require('bluebird');

const Crawler = require('./crawler');

const URL = 'https://www.99rpm.com/bajaj/parts.html#page=1';
class CrawlModels extends Crawler {
  constructor() {
    super();
    this.init();
  }

  async init() {
    await this.app.ready();
    const models = await this.getModelsLinks();
    if (models.length > 0) {
      await this.app.mongoose.VehicleModel.create(models);
    }
    // eslint-disable-next-line no-console
    console.log('Bajaj models imported in db');
    this.exit();
  }

  async getModelsLinks() {
    const links = [];
    const response = await this.parseUrl(URL);
    const $ = cheerio.load(response);
    const reg = /(.*)?\s\s+\(\d+\)/;
    $(response).find('#narrow-by-list ol li').map((index, element) => {
      const url = $(element).find('a').attr('href');
      if (url.indexOf('bajaj_vehicle_type') !== -1) {
        links.push({
          make: 'Bajaj',
          title: reg.exec($(element).find('a').text().trim())[1].trim(),
          link: url,
          count: $(element).find('span').text().replace('(', '')
            .replace(')', ''),
          parsed: false,
        });
      }
      return true;
    });
    return links;
  }
}

// eslint-disable-next-line no-new
new CrawlModels();
