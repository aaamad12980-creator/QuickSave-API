'use strict';

const { z } = require('zod');

/**
 * Schema for POST /download
 * Body: { url: string, format?: string, quality?: string }
 */
const downloadSchema = z.object({
  url: z
    .string({ required_error: 'url is required' })
    .trim()
    .min(1, 'url cannot be empty')
    .url('url must be a valid absolute URL'),
  format: z.enum(['mp4', 'mp3', 'webm']).optional().default('mp4'),
  quality: z.enum(['low', 'medium', 'high', 'best']).optional().default('best'),
});

module.exports = { downloadSchema };
