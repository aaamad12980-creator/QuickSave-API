'use strict';

const { chromium } = require('playwright');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');
const { parseNetscapeCookies } = require('../utils/cookieParser');

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: env.PLAYWRIGHT_HEADLESS });
  }
  return browserPromise;
}

const MAX_RESULTS = 10;

function dedupe(list) {
  return Array.from(new Set(list));
}

async function autoScroll(page, times = 2, pixels = 1800, delay = 400) {
  for (let i = 0; i < times; i++) {
    await page.mouse.wheel(0, pixels);
    await page.waitForTimeout(delay);
  }
}

async function collectUrls(page, selector, limit, filterFn = null) {
  let urls = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    const hrefs = await page.$$eval(selector, (anchors) => anchors.map((a) => a.href));
    urls = dedupe(filterFn ? hrefs.filter(filterFn) : hrefs);
    if (urls.length >= limit) break;
    await autoScroll(page);
  }
  return urls.slice(0, limit);
}

async function searchTikTok(query, limit = MAX_RESULTS) {
  const cappedLimit = Math.min(limit, MAX_RESULTS);
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; SM-A146U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  });
  const tiktokCookies = parseNetscapeCookies(env.TIKTOK_COOKIES_CONTENT);
  if (tiktokCookies.length) {
    await context.addCookies(tiktokCookies);
  }

  const page = await context.newPage();

  page.on('console', msg => {
    logger.info(`TikTok browser console: ${msg.text()}`);
  });

  try {
    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, {
      timeout: env.PLAYWRIGHT_TIMEOUT_MS,
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    const linkSelector = 'a[href*="/video/"], a[href*="@"]';
    await page.waitForSelector(linkSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS }).catch(() => null);

    const urls = await collectUrls(page, linkSelector, cappedLimit);

    if (urls.length === 0) {
      await page.screenshot({
        path: 'tiktok-debug.png',
        fullPage: true,
      });

      throw AppError.badRequest(
        'لم يتم العثور على نتائج مطابقة لبحثك في تيك توك',
        errorCodes.NO_RESULTS
      );
    }

    return urls;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error('TikTok search via Playwright failed', { query, error: err.message });
    throw AppError.internal('تعذر تنفيذ البحث في تيك توك حالياً', errorCodes.EXTRACTION_FAILED);
  } finally {
    await context.close();
  }
}

async function searchFacebook(query, limit = MAX_RESULTS) {
  const cappedLimit = Math.min(limit, MAX_RESULTS);
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });
  const fbCookies = parseNetscapeCookies(env.FB_COOKIES_CONTENT);
  if (fbCookies.length) {
    await context.addCookies(fbCookies);
  }

  const page = await context.newPage();

  try {
    await page.goto('https://www.facebook.com/', {
      timeout: env.PLAYWRIGHT_TIMEOUT_MS,
      waitUntil: 'domcontentloaded',
    });

    // Facebook renders its own search box (not a URL-based search) once the
    // shell has hydrated; on some layouts it's hidden behind a magnifier icon.
    const searchInputSelector =
      'input[aria-label="Search Facebook"], input[placeholder="Search Facebook"], input[type="search"]';
    const searchToggleSelector = '[aria-label="Search"], svg[aria-label="Search"]';

    let searchInput = await page
      .waitForSelector(searchInputSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS })
      .catch(() => null);

    if (!searchInput) {
      const toggle = await page.$(searchToggleSelector);
      if (toggle) {
        await toggle.click().catch(() => null);
        searchInput = await page
          .waitForSelector(searchInputSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS })
          .catch(() => null);
      }
    }

    if (!searchInput) {
      throw AppError.badRequest(
        'تعذر الوصول إلى مربع البحث في فيسبوك، قد يتطلب ذلك تسجيل الدخول',
        errorCodes.NO_RESULTS
      );
    }

    await searchInput.click();
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle', { timeout: env.PLAYWRIGHT_TIMEOUT_MS }).catch(() => null);

    const linkSelector = 'a[href*="/videos/"], a[href*="watch/?v="]';
    await page.waitForSelector(linkSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS }).catch(() => null);

    const videoPattern = /\/videos\/\d+|watch\/?\?v=\d+/i;
    const urls = await collectUrls(page, linkSelector, cappedLimit, (href) => videoPattern.test(href));

    if (urls.length === 0) {
      throw AppError.badRequest(
        'لم يتم العثور على نتائج فيديو مطابقة لبحثك على فيسبوك',
        errorCodes.NO_RESULTS
      );
    }

    return urls;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error('Facebook search via Playwright failed', { query, error: err.message });
    throw AppError.internal('تعذر تنفيذ البحث في فيسبوك حالياً', errorCodes.EXTRACTION_FAILED);
  } finally {
    await context.close();
  }
}

async function searchInstagram(query, limit = MAX_RESULTS) {
  const cappedLimit = Math.min(limit, MAX_RESULTS);
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });
  const igCookies = parseNetscapeCookies(env.IG_COOKIES_CONTENT);
  if (igCookies.length) {
    await context.addCookies(igCookies);
  }

  const page = await context.newPage();

  try {
    await page.goto('https://www.instagram.com/', {
      timeout: env.PLAYWRIGHT_TIMEOUT_MS,
      waitUntil: 'domcontentloaded',
    });

    // Instagram's search lives behind the nav search icon; the input only
    // mounts in the DOM after that icon is activated on most layouts.
    const searchInputSelector = 'input[placeholder="Search"], input[aria-label="Search input"]';
    const searchToggleSelector =
      'a[href="#"] svg[aria-label="Search"], span[aria-label="Search"], svg[aria-label="Search"]';

    let searchInput = await page
      .waitForSelector(searchInputSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS })
      .catch(() => null);

    if (!searchInput) {
      const toggle = await page.$(searchToggleSelector);
      if (toggle) {
        await toggle.click().catch(() => null);
        searchInput = await page
          .waitForSelector(searchInputSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS })
          .catch(() => null);
      }
    }

    if (!searchInput) {
      throw AppError.badRequest(
        'تعذر الوصول إلى مربع البحث في انستغرام، قد يتطلب ذلك تسجيل الدخول',
        errorCodes.NO_RESULTS
      );
    }

    await searchInput.click();
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle', { timeout: env.PLAYWRIGHT_TIMEOUT_MS }).catch(() => null);

    const linkSelector = 'a[href*="/reel/"], a[href*="/p/"]';
    await page.waitForSelector(linkSelector, { timeout: env.PLAYWRIGHT_TIMEOUT_MS }).catch(() => null);

    const urls = await collectUrls(page, linkSelector, cappedLimit);

    if (urls.length === 0) {
      throw AppError.badRequest(
        'لم يتم العثور على نتائج مطابقة لبحثك على انستغرام',
        errorCodes.NO_RESULTS
      );
    }

    return urls;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error('Instagram search via Playwright failed', { query, error: err.message });
    throw AppError.internal('تعذر تنفيذ البحث في انستغرام حالياً', errorCodes.EXTRACTION_FAILED);
  } finally {
    await context.close();
  }
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
