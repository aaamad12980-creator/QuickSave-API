'use strict';

const { chromium } = require('playwright');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: env.PLAYWRIGHT_HEADLESS });
  }
  return browserPromise;
}

/**
 * Searches TikTok's public search page for a keyword and scrapes the
 * first batch of visible video results.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
async function searchTikTok(query, limit = 12) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; SM-A146U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();

  try {
    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { timeout: env.PLAYWRIGHT_TIMEOUT_MS, waitUntil: 'domcontentloaded' });

    await page.waitForSelector('a[href*="/video/"]', { timeout: env.PLAYWRIGHT_TIMEOUT_MS }).catch(() => null);

    const results = await page.$$eval('a[href*="/video/"]', (anchors, max) => {
      const seen = new Set();
      const items = [];
      for (const a of anchors) {
        const href = a.href;
        if (seen.has(href)) continue;
        seen.add(href);

        const img = a.querySelector('img');
        const captionEl = a.closest('div')?.querySelector('[data-e2e="search-card-desc"]');

        items.push({
          url: href,
          thumbnail: img ? img.src : null,
          title: captionEl ? captionEl.textContent.trim() : null,
        });
        if (items.length >= max) break;
      }
      return items;
    }, limit);

    return results;
  } catch (err) {
    logger.error('TikTok search via Playwright failed', { query, error: err.message });
    throw AppError.internal('تعذر تنفيذ البحث في تيك توك حالياً', errorCodes.EXTRACTION_FAILED);
  } finally {
    await context.close();
  }
}

async function searchUnavailable(platformNameArabic) {
  throw AppError.badRequest(
    `البحث بالكلمات داخل ${platformNameArabic} غير متاح حالياً، لكن يمكنك لصق رابط الفيديو مباشرة وسيعمل بشكل طبيعي`,
    errorCodes.NOT_IMPLEMENTED
  );
}

async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

module.exports = {
  searchTikTok,
  searchUnavailable,
  closeBrowser,
};
