const Promise = require('bluebird');
const Base = require('./base');

const FILE_PATH = '../csv-data/story.json';
class StoryMaster extends Base {
  constructor() {
    super();
    this.filePath = FILE_PATH;
  }

  async init() {
    await this.app.ready();
    const data = await this.getFileContent(this.filePath);
    const stories = JSON.parse(data);
    // itrate and save in db
    await Promise.mapSeries(stories, async (story) => {
      if (story.title) {
        await this.app.mongoose.Story.create(story);
      }
      return true;
    });
    this.exit();
  }
}

const story = new StoryMaster();
story.init();
