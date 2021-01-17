'use strict';
const url = require('url');
const got = require('got');
const cheerio = require('cheerio');

const args = process.argv.slice(2);

async function crawl(urlData) {
  let data = [];

  try {
    const { body } = await got.get(urlData);
    const $ = cheerio.load(body);


    for (let i = 0; i < $('a').length; i += 1) {
      let anchor = $('a').eq(i);
      let href = anchor.attr('href');
      let isNotUndefined = href !== undefined;
      let isNotEmpty = isNotUndefined && href.trim() !== '';
      let isNotHash = isNotUndefined && !(href.trim().indexOf('#') === 0);
      let hasNotHrefInData = isNotUndefined && data.indexOf(href.trim()) === -1;
      let hasOneFirstSlash = isNotUndefined && (href.trim().indexOf('/') > -1 && href.trim().indexOf('//') === -1);
      let hasDoubleFirstSlash = isNotUndefined && (href.trim().indexOf('//') === 0);

      if (hasOneFirstSlash) {
        href = url.resolve(urlData, href);
      } if (hasDoubleFirstSlash) {
        href = 'http:' + href;
      } if (isNotEmpty && (isNotHash && hasNotHrefInData)) {
        data.push(href);
      }
    }
  } catch (e) {
    return data;
  }

  return data;
}

let dataCache = [];

async function leveledCrawler(item) {
  try {
    let subData = await crawl(item);

    for (let subItem of subData) {
      if (dataCache.indexOf(subItem) === -1) {
        dataCache.push(subItem);
        console.log(subItem);
      }

      run(subItem);
    }
  } catch (e) {
    return;
  }
}

async function run(entrypoint) {
  try {
    let data = await crawl(entrypoint);
    let isDeepCrawler = args[1] !== undefined && args[1] === 'enabled';

    for (let item of data) {
      if (dataCache.indexOf(item) === -1) {
        dataCache.push(item);
        console.log(item);
      }

      if (isDeepCrawler) {
        leveledCrawler(item);
      }
    }
  } catch(e) {
    return;
  }
}

(async function () {
  run(args[0]);
})();
