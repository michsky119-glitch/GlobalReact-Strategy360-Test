const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title required' });
    }
    const stmt = db.prepare(
      'INSERT INTO tasks (title, description) VALUES (?, ?)'
    );
    const result = stmt.run(title.slice(0, 255), description || '');
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { title, description } = req.body;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'not found' });
    const newTitle = title !== undefined ? String(title).slice(0, 255) : existing.title;
    const newDesc = description !== undefined ? description : existing.description;
    db.prepare(
      'UPDATE tasks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(newTitle, newDesc, req.params.id);
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
