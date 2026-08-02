'use strict';

const ytdlpService = require('./ytdlpService');
const playwrightSearchService = require('./playwrightSearchService');

/**
 * Facebook platform service.
 * Direct links go through yt-dlp. Keyword search is not available for
 * Facebook (their search requires a logged-in session) — see
 * playwrightSearchService.js for details.
 */
class FacebookService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search() {
    return playwrightSearchService.searchUnavailable('فيسبوك');
  }
}

module.exports = new FacebookService();
