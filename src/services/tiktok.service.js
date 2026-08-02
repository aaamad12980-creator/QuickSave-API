'use strict';

const ytdlpService = require('./ytdlpService');
const playwrightSearchService = require('./playwrightSearchService');

/**
 * TikTok platform service.
 * Direct links go through yt-dlp (fast, reliable, no browser needed).
 * Keyword search uses Playwright since yt-dlp cannot search TikTok itself.
 */
class TiktokService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search(query) {
    return playwrightSearchService.searchTikTok(query, 12);
  }
}

module.exports = new TiktokService();
