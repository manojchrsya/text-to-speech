## Project based on Speech Synthesis of browser
--------------------------------------------------------------

Text to Speech contains 2 different modules to completed.
- Crawler - to get data from different web pages to store contents for examples
- Tesseract - to parse image and get content from it
- SpeechSynthesis - to listen text in audio form

you can check below code snippets:

``` javascript
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
```
for more details please check `bin/crawler.js`

``` javascript
  class Tesseract {
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
```
for more details please check `lib/Tesseract.js`

``` javascript
  this._speechSynthesis = new SpeechSynthesisUtterance();
  this._speechSynthesis.onend = this._onEnd;
  this._speechSynthesis.onstart = this._onStart;
  this._speechSynthesis.onerror = this._onError;

  this._speechSynthesis.text = this.editor.getLine(this.currentLine);
  window.setTimeout(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume(this._speechSynthesis);
    } else {
      window.speechSynthesis.speak(this._speechSynthesis);
    }
  }, 200);
```
for more details please check `public/vendor/text-to-speech.js`
### Installation

It requires [Node.js](https://nodejs.org/) to run.
Install the dependencies and devDependencies and start the server.

```sh
$ cd text-to-speech
$ npm install -d
$ npm run dev or npm run start
```
------

Read and Listen text using Browser's `Speech Synthesis` feature.

### Demo

To checkout demo please visit below url

https://speech-textfy.herokuapp.com/
