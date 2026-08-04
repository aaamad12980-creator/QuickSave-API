'use strict';

const ytdlpService = require('./ytdlpService');
const playwrightSearchService = require('./playwrightSearchService');

/**
 * TikTok platform service.
 * Direct links go through yt-dlp (fast, reliable, no browser needed).
 * Keyword search uses Playwright to get video URLs, then yt-dlp to
 * fetch metadata for each URL (title, thumbnail).
 */
class TiktokService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search(query) {
    const urls = await playwrightSearchService.searchTikTok(query, 10);

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

module.exports = new TiktokService();
