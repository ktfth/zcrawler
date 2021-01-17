'use strict';
const url = require('url');
const got = require('got');
const cheerio = require('cheerio');

const args = process.argv.slice(2);

async function crawl(urlData) {
  const { body } = await got.get(urlData);
  const $ = cheerio.load(body);

  let data = [];

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

  return data;
}

(async function () {
  let data = await crawl(args[0]);

  let isDeepCrawler = args[1] !== undefined && args[1] === 'enabled';

  for (let item of data) {
    console.log(item);

    if (isDeepCrawler) {
      try {
        let subData = await crawl(item);

        for (let subItem of subData) {
          if (data.indexOf(subItem) === -1) {
            console.log('--', subItem);
          }
        }
      } catch (e) {
        break;
      }
    }
  }
})();
