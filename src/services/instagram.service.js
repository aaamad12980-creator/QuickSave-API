'use strict';

const ytdlpService = require('./ytdlpService');
const playwrightSearchService = require('./playwrightSearchService');

/**
 * Instagram platform service.
 * Direct links go through yt-dlp. Keyword search is not available for
 * Instagram (their search requires a logged-in session) — see
 * playwrightSearchService.js for details.
 */
class InstagramService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search() {
    return playwrightSearchService.searchUnavailable('انستجرام');
  }
}

module.exports = new InstagramService();
