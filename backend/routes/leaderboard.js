const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /leaderboard - Get top 5 most clicked URLs
router.get('/', async (req, res) => {
  try {
    const topUrls = await prisma.shortUrl.findMany({
      include: {
        _count: {
          select: { clicks: true }
        }
      },
      orderBy: {
        clicks: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const leaderboard = topUrls.map(shortUrl => ({
      shortcode: shortUrl.shortcode,
      url: shortUrl.url,
      clicks: shortUrl._count.clicks,
      validity: shortUrl.validity.toISOString(),
      isExpired: new Date() > shortUrl.validity
    }));

    res.json(leaderboard);

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
