const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
const logger = require('../logging-middleware');
const shortUrlsRouter = require('./routes/shorturls');
const leaderboardRouter = require('./routes/leaderboard');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/shorturls', shortUrlsRouter);
app.use('/leaderboard', leaderboardRouter);

// GET /:shortcode - Redirect to original URL
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { shortcode }
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if URL has expired
    if (new Date() > shortUrl.expiry) {
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Record click
    await prisma.click.create({
      data: {
        shorturlId: shortUrl.id,
        referrer: req.get('Referrer') || null,
        geo: 'IN' // Default geo location as specified
      }
    });

    // Redirect to original URL
    res.redirect(302, shortUrl.originalUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
