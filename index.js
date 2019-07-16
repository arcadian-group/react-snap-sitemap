const builder = require('xmlbuilder');
const { readdir, writeFile, lstat } = require('fs');
const { promisify } = require('util');

const asyncReaddir = promisify(readdir), asyncWriteFile = promisify(writeFile), asyncLStat = promisify(lstat);

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

let allRoots = [];

const readSite = async (dir) => {
    const directory = await asyncReaddir(dir, { withFileTypes: true });

    await asyncForEach(directory, async fileOrDirectory => {
        const root = `${dir}/${fileOrDirectory}`;
        const stat = await asyncLStat(root);

        if (stat.isDirectory()) {
            await readSite(root);
        } else if (fileOrDirectory === 'index.html') {
            allRoots = [...allRoots, root];
        }
    });
}

const blackList = [];

(async () => {
    const baseUrl = 'https://helixpersonas.com.au/';

    await readSite('build');

    const siteUrls = allRoots.map(root => root.replace('build/', baseUrl).replace('/index.html', ''));

    const urlset = builder.create('urlset', { encoding: 'UTF-8', version: '1.0' });

    urlset.attribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    siteUrls
        .filter(url => !blackList.includes(url))
        .sort((a, b) => a.length - b.length)
        .forEach(url => {
            const u = urlset.ele('url');

            u.ele('loc', url);
            u.ele('priority', 0.5);
        });

    const sitemap = urlset.end({ pretty: true });

    await asyncWriteFile('build/sitemap.xml', sitemap);
})();
