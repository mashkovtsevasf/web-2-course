const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res, next) => {
  try {
    const categories = await db.query(
      'SELECT * FROM Categories WHERE is_active = 1 ORDER BY category_name'
    );
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await db.get(
      'SELECT * FROM Categories WHERE category_id = ? AND is_active = 1',
      [id]
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
});

module.exports = router;




