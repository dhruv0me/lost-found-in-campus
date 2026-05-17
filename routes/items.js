const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute } = require('../database/db');
const upload = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// GET /api/items
router.get('/', (req, res) => {
  try {
    const { type, category, location, status, search, sort = 'newest', page = 1, limit = 12, email } = req.query;

    let where = '1=1';
    const params = [];

    if (type) { where += ' AND type = ?'; params.push(type); }
    if (category) { where += ' AND category = ?'; params.push(category); }
    if (location) { where += ' AND location = ?'; params.push(location); }
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (email) { where += ' AND poster_email = ?'; params.push(email); }
    if (search) { where += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const countResult = queryOne(`SELECT COUNT(*) as total FROM items WHERE ${where}`, params);
    const total = countResult ? countResult.total : 0;

    const order = sort === 'oldest' ? 'ASC' : 'DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const allParams = [...params, parseInt(limit), offset];

    const items = queryAll(`SELECT * FROM items WHERE ${where} ORDER BY created_at ${order} LIMIT ? OFFSET ?`, allParams);

    res.json({
      items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/items/:id
router.get('/:id', (req, res) => {
  try {
    const item = queryOne('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.claims = queryAll('SELECT * FROM claims WHERE item_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/items
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { type, title, description, category, location, date_occurred, poster_name, poster_email, poster_phone } = req.body;
    if (!type || !title || !description || !category || !location || !date_occurred || !poster_name || !poster_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = uuidv4();
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    execute(
      `INSERT INTO items (id, type, title, description, category, location, date_occurred, image_url, poster_name, poster_email, poster_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, title, description, category, location, date_occurred, image_url, poster_name, poster_email, poster_phone || null]
    );

    const item = queryOne('SELECT * FROM items WHERE id = ?', [id]);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id
router.put('/:id', upload.single('image'), (req, res) => {
  try {
    const existing = queryOne('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Item not found' });

    const { type, title, description, category, location, date_occurred, poster_name, poster_email, poster_phone, status } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : existing.image_url;

    execute(
      `UPDATE items SET type=COALESCE(?,type), title=COALESCE(?,title), description=COALESCE(?,description), category=COALESCE(?,category), location=COALESCE(?,location), date_occurred=COALESCE(?,date_occurred), image_url=COALESCE(?,image_url), poster_name=COALESCE(?,poster_name), poster_email=COALESCE(?,poster_email), poster_phone=COALESCE(?,poster_phone), status=COALESCE(?,status), updated_at=datetime('now') WHERE id=?`,
      [type||null, title||null, description||null, category||null, location||null, date_occurred||null, image_url, poster_name||null, poster_email||null, poster_phone||null, status||null, req.params.id]
    );

    const item = queryOne('SELECT * FROM items WHERE id = ?', [req.params.id]);
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = queryOne('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    execute('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
