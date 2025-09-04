const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const validator = require('validator');

const router = express.Router();
const prisma = new PrismaClient();

// POST /shorturls - Create short URL
router.post('/', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Enhanced URL validation
    const trimmedUrl = url.trim();
    if (!validator.isURL(trimmedUrl, { protocols: ['http', 'https'], require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid URL format. Must be http:// or https://' });
    }

    // Generate shortcode if not provided
    let finalShortcode = shortcode;
    if (!finalShortcode) {
      finalShortcode = nanoid(8);
    } else {
      // Check if custom shortcode already exists
      const existing = await prisma.shortUrl.findUnique({
        where: { shortcode: finalShortcode }
      });
      if (existing) {
        return res.status(400).json({ error: 'Shortcode already exists' });
      }
    }

    // Calculate expiry (default 30 minutes)
    const validityMinutes = validity || 30;
    const expiry = new Date(Date.now() + validityMinutes * 60 * 1000);

    // Create short URL
    const shortUrl = await prisma.shortUrl.create({
      data: {
        url: trimmedUrl,
        shortcode: finalShortcode,
        validity: expiry
      }
    });

    const shortLink = `http://localhost:5001/${finalShortcode}`;

    // Generate QR Code
    const qrCodeDataURL = await QRCode.toDataURL(shortLink, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      shortLink,
      expiry: expiry.toISOString(),
      qrCode: qrCodeDataURL
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shorturls/:shortcode - Get stats
router.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { shortcode },
      include: {
        clicks: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      originalUrl: shortUrl.url,
      expiry: shortUrl.validity.toISOString(),
      totalClicks: shortUrl.clicks.length,
      logs: shortUrl.clicks.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        geo: click.geo
      }))
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
