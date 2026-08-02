'use strict';

const { chromium } = require('playwright');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');
const ytdlpService = require('./ytdlpService');

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: env.PLAYWRIGHT_HEADLESS });
  }
  return browserPromise;
}

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

async function collectGoogleSiteLinks(domain, query, rawLimit = 20) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `site:${domain} ${query}`
    )}&num=${rawLimit}&hl=en`;

    await page.goto(searchUrl, { timeout: env.PLAYWRIGHT_TIMEOUT_MS, waitUntil: 'domcontentloaded' });

    const hrefs = await page.$$eval('a', (anchors) => anchors.map((a) => a.href));

    const seen = new Set();
    const cleaned = [];

    for (const href of hrefs) {
      let url = href;

      try {
        const parsed = new URL(href);
        const wrapped = parsed.searchParams.get('q');
        if (wrapped) url = wrapped;
      } catch {
        continue;
      }

      if (!url.includes(domain)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      cleaned.push(url);
    }

    return cleaned;
  } catch (err) {
    logger.error('Google site-search via Playwright failed', { domain, query, error: err.message });
    return [];
  } finally {
    await context.close();
  }
}

async function searchViaGoogleSite(domain, query, videoLikePattern, limit = 8) {
  const rawLinks = await collectGoogleSiteLinks(domain, query, 20);
  const candidates = rawLinks.filter((url) => videoLikePattern.test(url)).slice(0, limit + 4);

  const results = [];
  for (const url of candidates) {
    if (results.length >= limit) break;
    try {
      const metadata = await ytdlpService.getMetadata(url);
      results.push({
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration,
        uploader: metadata.uploader,
        url,
      });
    } catch {
      continue;
    }
  }

  if (results.length === 0) {
    throw AppError.badRequest(
      'لم يتم العثور على نتائج عامة مطابقة لبحثك، جرّب لصق رابط الفيديو مباشرة',
      errorCodes.NO_RESULTS
    );
  }

  return results;
}

async function searchFacebook(query, limit = 8) {
  return searchViaGoogleSite('facebook.com', query, /\/videos\/|watch\/\?v=/i, limit);
}

async function searchInstagram(query, limit = 8) {
  return searchViaGoogleSite('instagram.com', query, /\/reel\/|\/p\//i, limit);
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
  searchFacebook,
  searchInstagram,
  closeBrowser,
};
