const express = require('express');
const router = express.Router();
const { queryOne } = require('../database/db');

// GET /api/stats
router.get('/', (req, res) => {
  try {
    const total = queryOne('SELECT COUNT(*) as count FROM items').count;
    const active = queryOne("SELECT COUNT(*) as count FROM items WHERE status = 'active'").count;
    const claimed = queryOne("SELECT COUNT(*) as count FROM items WHERE status = 'claimed'").count;
    const resolved = queryOne("SELECT COUNT(*) as count FROM items WHERE status = 'resolved'").count;
    const lost = queryOne("SELECT COUNT(*) as count FROM items WHERE type = 'lost'").count;
    const found = queryOne("SELECT COUNT(*) as count FROM items WHERE type = 'found'").count;
    const totalClaims = queryOne('SELECT COUNT(*) as count FROM claims').count;

    res.json({ total, active, claimed, resolved, lost, found, totalClaims, reunited: claimed + resolved });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
