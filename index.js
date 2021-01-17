'use strict';
const url = require('url');
const got = require('got');
const cheerio = require('cheerio');

const args = process.argv.slice(2);

(async function () {
  const { body } = await got.get(args[0]);
  const $ = cheerio.load(body);

  let data = [];

  for (let i = 0; i < $('a').length; i += 1) {
    let anchor = $('a').eq(i);
    let href = anchor.attr('href');
    let isNotUndefined = href !== undefined;
    let isNotEmpty = isNotUndefined && href.trim() !== '';
    let isNotHash = isNotUndefined && !(href.trim().indexOf('#') === 0);
    let hasNotHrefInData = isNotUndefined && data.indexOf(href.trim()) === -1;
    if (isNotEmpty && (isNotHash && hasNotHrefInData)) {
      console.log(href);
    }
  }
})();
