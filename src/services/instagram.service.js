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
    return playwrightSearchService.searchInstagram(query, 8);
  }
}

module.exports = new InstagramService();
