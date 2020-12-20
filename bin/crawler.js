const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const Promise = require('bluebird');

const FILE_PATH = './csv-data/story.json';
// 'http://www.english-for-students.com/Hindi-Short-Stories.html',
const URLS = [
  'https://hindistory.net/story/5'
];

class Crawler {
  constructor() {
    this.urls = URLS;
    this.filePath = FILE_PATH;
  }

  async crawl() {
    const links = await this.getPrimaryLinks();
    const data = [];
    await Promise.mapSeries(links, async (link) => {
      const item = {};
      const response = await this.parseUrl(link);
      const $ = cheerio.load(response);
      item.title = $(response).find('.content-wrapper h1.story-head').text();
      item.content = $(response).find('.content-wrapper > div p').text();
      item.featured = false;
      item.category = ['story'];
      item.lang = ['hi-IN', 'hi_IN'];
      data.push(item);
      return true;
    });
    this.dump(data);
    console.log('-----parsing data complete--------');
    process.exit();
  }

  async parseUrl(url) {
    console.log(`crawling ${url}`);
    return new Promise((resolve) => {
      request(url, function (error, response) {
        if (error) {
          console.error(error);
          return false;
        }
        return resolve(response.body);
      });
    });
  }

  async getPrimaryLinks() {
    const links = [];
    // await Promise.mapSeries(this.urls, async (url) => {
    //   const response = await this.parseUrl(url);
    //   const $ = cheerio.load(response);
    //   $('#cardholder > article').each(async (index, data) => {
    //     $(data).find('.post-title').each((index, story) => {
    //       links.push($(story).find('a').attr('href'));
    //     });
    //   })
    // });
    for (let i = 5; i < 50; i++) {
      links.push(`https://hindistory.net/story/${i}`)
    }
    return links;
  }

  async dump(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(error);
    }
  }
}

const crawler = new Crawler();
crawler.crawl();
