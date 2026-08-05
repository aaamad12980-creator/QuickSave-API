'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Small helper to read env vars with a fallback + type coercion.
 */
function getEnv(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

function getEnvInt(key, fallback) {
  const value = process.env[key];
  const parsed = value ? parseInt(value, 10) : NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
}

const env = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  APP_NAME: getEnv('APP_NAME', 'QuickSave'),
  PORT: getEnvInt('PORT', 5000),
  API_PREFIX: getEnv('API_PREFIX', '/api/v1'),

  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  LOG_DIR: getEnv('LOG_DIR', 'logs'),

  CORS_ORIGIN: getEnv('CORS_ORIGIN', '*'),

  RATE_LIMIT_WINDOW_MS: getEnvInt('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvInt('RATE_LIMIT_MAX_REQUESTS', 100),

  TEMP_DIR: getEnv('TEMP_DIR', 'temp'),
  DOWNLOADS_DIR: getEnv('DOWNLOADS_DIR', 'downloads'),

  JSON_BODY_LIMIT: getEnv('JSON_BODY_LIMIT', '1mb'),

  YTDLP_PATH: getEnv('YTDLP_PATH', 'yt-dlp'),
  YTDLP_TIMEOUT_MS: getEnvInt('YTDLP_TIMEOUT_MS', 30000),
  YTDLP_COOKIES_FILE: getEnv('YTDLP_COOKIES_FILE', ''),
  YTDLP_COOKIES_CONTENT: getEnv('YTDLP_COOKIES_CONTENT', ''),
  FB_COOKIES_CONTENT: getEnv('FB_COOKIES_CONTENT', ''),
  IG_COOKIES_CONTENT: getEnv('IG_COOKIES_CONTENT', ''),
  TIKTOK_COOKIES_CONTENT: getEnv('TIKTOK_COOKIES_CONTENT', ''),

  PLAYWRIGHT_TIMEOUT_MS: getEnvInt('PLAYWRIGHT_TIMEOUT_MS', 25000),
  PLAYWRIGHT_HEADLESS: getEnv('PLAYWRIGHT_HEADLESS', 'true') !== 'false',

  isProduction() {
    return this.NODE_ENV === 'production';
  },
  isDevelopment() {
    return this.NODE_ENV === 'development';
  },
};

if (env.YTDLP_COOKIES_CONTENT && !env.YTDLP_COOKIES_FILE) {
  const fs = require('fs');
  const cookiesPath = path.resolve(process.cwd(), 'yt-cookies.txt');
  fs.writeFileSync(cookiesPath, env.YTDLP_COOKIES_CONTENT, 'utf8');
  env.YTDLP_COOKIES_FILE = cookiesPath;
}

module.exports = env;
