'use strict';

const ytdlpService = require('./ytdlpService');

/**
 * YouTube platform service.
 * Handles both direct-link lookups and text search (using yt-dlp's
 * ytsearch: feature, which works natively and reliably for YouTube).
 */
class YoutubeService {
  async fetchMetadata(url) {
    return ytdlpService.getMetadata(url);
  }

  async download(url) {
    return ytdlpService.getMetadata(url);
  }

  async search(query) {
    return ytdlpService.searchYoutube(query, 15);
  }
}

module.exports = new YoutubeService();
