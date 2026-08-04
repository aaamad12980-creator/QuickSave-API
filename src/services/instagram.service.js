'use strict';

const ytdlpService = require('./ytdlpService');
const playwrightSearchService = require('./playwrightSearchService');

class InstagramService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search(query) {
    const urls = await playwrightSearchService.searchInstagram(query, 10);

    const results = [];

    for (const url of urls) {
      try {
        const metadata = await ytdlpService.getMetadata(url);

        results.push({
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          url
        });
      } catch (error) {
        continue;
      }
    }

    return results;
  }
}

module.exports = new InstagramService();
