'use strict';

const { spawn } = require('child_process');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const finalArgs = [
      '-m', 'yt_dlp',
      ...args,
      '--no-warnings',
      '--no-playlist',
      '--socket-timeout', '15',
      '--extractor-args', 'youtube:player_client=web_embedded',
      '--format', 'best',
      '--allow-unplayable-formats',
    ];

    if (env.YTDLP_COOKIES_FILE) {
      finalArgs.push('--cookies', env.YTDLP_COOKIES_FILE);
    }

    const child = spawn('python3', finalArgs);

    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`yt-dlp timed out after ${env.YTDLP_TIMEOUT_MS}ms`));
    }, Number(env.YTDLP_TIMEOUT_MS) || 30000);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on('close', (exitCode) => {
      clearTimeout(timeout);
      if (exitCode !== 0) {
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${exitCode}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function classifyFormats(formats = []) {
  const usable = formats.filter((f) => f.url && (f.vcodec !== 'none' || f.acodec !== 'none'));

  const combined = usable
    .filter((f) => f.vcodec !== 'none' && f.acodec !== 'none')
    .sort((a, b) => (b.height || 0) - (a.height || 0));

  const videoOnly = usable
    .filter((f) => f.vcodec !== 'none' && f.acodec === 'none')
    .sort((a, b) => (b.height || 0) - (a.height || 0));

  const audioOnly = usable
    .filter((f) => f.vcodec === 'none' && f.acodec !== 'none')
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));

  const qualities = combined.map((f) => ({
    quality: f.height ? `${f.height}p` : (f.format_note || f.format_id),
    formatId: f.format_id,
    url: f.url,
    ext: f.ext,
    filesize: f.filesize || f.filesize_approx || null,
    separate: false,
  }));

  const combinedHeights = new Set(combined.map((f) => f.height));
  const bestAudio = audioOnly[0] || null;

  videoOnly.forEach((f) => {
    if (!f.height || combinedHeights.has(f.height)) return;
    if (!bestAudio) return;

    qualities.push({
      quality: `${f.height}p`,
      formatId: f.format_id,
      videoUrl: f.url,
      audioUrl: bestAudio.url,
      videoExt: f.ext,
      audioExt: bestAudio.ext,
      filesize: (f.filesize || f.filesize_approx || 0) + (bestAudio.filesize || bestAudio.filesize_approx || 0) || null,
      separate: true,
    });
  });

  const seen = new Set();
  return qualities
    .sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))
    .filter((q) => {
      if (seen.has(q.quality)) return false;
      seen.add(q.quality);
      return true;
    });
}

async function getMetadata(url) {
  let raw;
  try {
    raw = await runYtDlp(['--dump-single-json', url]);
  } catch (err) {
    logger.error('yt-dlp metadata extraction failed', { url, error: err.message });
    throw AppError.badRequest(
      'yt-dlp error: ' + err.message,
      errorCodes.EXTRACTION_FAILED
    );
  }

  let info;
  try {
    info = JSON.parse(raw);
  } catch {
    throw AppError.internal('yt-dlp returned malformed JSON', errorCodes.EXTRACTION_FAILED);
  }

  const qualities = classifyFormats(info.formats || []);

  return {
    title: info.title || null,
    thumbnail: info.thumbnail || (info.thumbnails?.at(-1)?.url ?? null),
    duration: info.duration || null,
    uploader: info.uploader || info.channel || null,
    sourceUrl: url,
    directUrl: info.url || qualities.find((q) => !q.separate)?.url || null,
    qualities,
  };
}

async function searchYoutube(query, limit = 15) {
  let raw;
  try {
    raw = await runYtDlp(['--dump-json', `ytsearch${limit}:${query}`]);
  } catch (err) {
    logger.error('yt-dlp search failed', { query, error: err.message });
    throw AppError.internal('yt-dlp error: ' + err.message, errorCodes.EXTRACTION_FAILED);
  }

  const lines = raw.split('\n').filter(Boolean);
  const results = lines.map((line) => {
    const info = JSON.parse(line);
    return {
      title: info.title || null,
      thumbnail: info.thumbnail || (info.thumbnails?.at(-1)?.url ?? null),
      duration: info.duration || null,
      uploader: info.uploader || info.channel || null,
      url: info.webpage_url || info.url,
    };
  });

  return results;
}

module.exports = { getMetadata, searchYoutube };
