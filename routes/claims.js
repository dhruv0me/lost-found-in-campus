const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const { sendClaimNotification } = require('../utils/mailer');

// POST /api/items/:id/claims
router.post('/items/:id/claims', async (req, res) => {
  try {
    const item = queryOne('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { claimant_name, claimant_email, claimant_phone, proof_description } = req.body;
    if (!claimant_name || !claimant_email || !proof_description) {
      return res.status(400).json({ error: 'Name, email, and proof description are required' });
    }

    const id = uuidv4();
    execute(
      `INSERT INTO claims (id, item_id, claimant_name, claimant_email, claimant_phone, proof_description) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.params.id, claimant_name, claimant_email, claimant_phone || null, proof_description]
    );

    execute("UPDATE items SET status = 'claimed', updated_at = datetime('now') WHERE id = ?", [req.params.id]);

    const emailSent = await sendClaimNotification({
      posterEmail: item.poster_email, posterName: item.poster_name,
      item, claimant: { name: claimant_name, email: claimant_email, phone: claimant_phone, proofDescription: proof_description }
    });

    const claim = queryOne('SELECT * FROM claims WHERE id = ?', [id]);
    res.status(201).json({
      claim, emailSent,
      message: emailSent ? 'Claim submitted and notification sent to the poster!' : 'Claim submitted! (Email notification could not be sent — check server email config)'
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

// GET /api/items/:id/claims
router.get('/items/:id/claims', (req, res) => {
  try {
    const claims = queryAll('SELECT * FROM claims WHERE item_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

module.exports = router;
