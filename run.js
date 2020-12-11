#!/usr/bin/env node

const builder = require('xmlbuilder');
const {readdir, writeFile, lstat} = require('fs');
const {promisify} = require('util');
const args = process.argv;

const preFormattedBaseUrl = args.find((arg) => arg.startsWith('--base-url='));
const exclusionList = args.find((arg) => arg.startsWith('--black-list='));
const preFormattedChangeFrequency = args.find((arg) => arg.startsWith('--change-frequency='));
let blackList = [];

if (exclusionList) {
  let params = exclusionList.split('=')[1];
  blackList = params.split(',');
  console.log('👋 Exluding URLs:', blackList.join(', '))
}

let baseUrl;

if (preFormattedBaseUrl) {
  baseUrl = preFormattedBaseUrl.split('=')[1];
} else {
  throw (new Error('Missing valid --base-url command line argument'));
}

if (baseUrl.length === 0) {
  throw (new Error('Pass a valid url to --base-url'));
}

let changeFrequency;

if (preFormattedChangeFrequency) {
  changeFrequency = preFormattedChangeFrequency.split('=')[1];
} else {
  changeFrequency = 'monthly';
}

const asyncReaddir = promisify(readdir), asyncWriteFile = promisify(writeFile), asyncLStat = promisify(lstat);

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

let allRoots = [];

const readSite = async (dir) => {
  const directory = await asyncReaddir(dir, {withFileTypes: true});

  await asyncForEach(directory, async fileOrDirectory => {
    let path = fileOrDirectory;

    if (typeof fileOrDirectory === 'object') {
      path = fileOrDirectory.name;
    }

    if (path === '404') {
      return;
    }

    const root = `${dir}/${path}`;

    const stat = await asyncLStat(root);

    if (stat.isDirectory()) {
      await readSite(root);
    } else if (path === 'index.html') {
      allRoots = [...allRoots, root];
    }
  });
}

const formatDate = (date) => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

(async () => {
  await readSite('build');

  const siteUrls = allRoots.map(root => root.replace('build/', baseUrl).replace('/index.html', ''));

  const urlset = builder.create('urlset', {encoding: 'UTF-8', version: '1.0'});

  urlset.attribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  siteUrls
    .filter(url => !blackList.includes(url))
    .sort((a, b) => a.length - b.length)
    .forEach(url => {
      const u = urlset.ele('url');
      u.ele('loc', url);
      u.ele('lastmod', formatDate(Date.now()))
      if (changeFrequency) {
        u.ele('changefreq', changeFrequency);
      }

      url === baseUrl
        ? u.ele('priority', 1)
        : u.ele('priority', 0.8);
    });

  const sitemap = urlset.end({pretty: true});

  await asyncWriteFile('build/sitemap.xml', sitemap);

  console.log('🙂 Successfully built sitemap.xml in build directory');
})();
