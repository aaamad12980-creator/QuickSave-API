'use strict';

const ytdlpService = require('./ytdlpService');

/**
 * YouTube platform service.
 * Handles both direct-link lookups and text search.
 * Search: Playwright يجيب روابط النتائج، وyt-dlp يجيب التفاصيل الكاملة
 * لكل رابط (وإن فشل، برضه بيرجع الرابط والعنوان على الأقل).
 */
class YoutubeService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search(query) {
    const results = await ytdlpService.searchYoutube(query, 15);
    return results.map((r) => ({
      title: r.title,
      thumbnail: r.thumbnail,
      url: r.sourceUrl,
    }));
  }
}

module.exports = new YoutubeService();
