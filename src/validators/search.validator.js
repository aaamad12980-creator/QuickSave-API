'use strict';

const { z } = require('zod');

/**
 * Schema for POST /search
 *
 * Two supported shapes:
 *  1) Direct link pasted by the user:      { "url": "https://..." }
 *  2) Keyword search within a platform:    { "query": "...", "platform": "youtube" }
 */
const linkSearchSchema = z.object({
  url: z
    .string({ required_error: 'url is required' })
    .trim()
    .min(1, 'url cannot be empty')
    .url('url must be a valid absolute URL'),
});

const keywordSearchSchema = z.object({
  query: z
    .string({ required_error: 'query is required' })
    .trim()
    .min(1, 'query cannot be empty'),
  platform: z.enum(['youtube', 'tiktok', 'facebook', 'instagram'], {
    required_error: 'platform is required',
  }),
});

const searchSchema = z.union([linkSearchSchema, keywordSearchSchema]);

module.exports = { searchSchema, linkSearchSchema, keywordSearchSchema };
