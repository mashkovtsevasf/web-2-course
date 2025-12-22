const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const { category, search, sales_status } = req.query;
    let sql = `
      SELECT 
        p.*,
        c.category_name,
        c.category_slug
      FROM Products p
      INNER JOIN Categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1
    `;
    const params = [];
    
    if (category) {
      sql += ' AND c.category_slug = ?';
      params.push(category);
    }
    
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (sales_status !== undefined) {
      sql += ' AND p.sales_status = ?';
      params.push(sales_status === 'true' ? 1 : 0);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const products = await db.query(sql, params);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to find by product_id OR product_code
    const product = await db.get(
      `SELECT 
        p.*,
        c.category_name,
        c.category_slug
      FROM Products p
      INNER JOIN Categories c ON p.category_id = c.category_id
      WHERE (p.product_id = ? OR p.product_code = ?) AND p.is_active = 1`,
      [id, id]
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const {
      product_code,
      name,
      description,
      price,
      stock,
      image_url,
      color,
      size,
      category_id,
      sales_status,
      rating,
      popularity
    } = req.body;
    
    if (!product_code || !name || !price || !category_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.run(
      `INSERT INTO Products (
        product_code, name, description, price, stock, image_url,
        color, size, category_id, sales_status, rating, popularity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_code, name, description || null, price, stock || 0,
        image_url || null, color || null, size || null, category_id,
        sales_status ? 1 : 0, rating || 0, popularity || 0
      ]
    );
    
    const product = await db.get(
      'SELECT * FROM Products WHERE product_id = ?',
      [result.lastID]
    );
    
    res.status(201).json(product);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Product code already exists' });
    }
    next(error);
  }
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      image_url,
      color,
      size,
      category_id,
      sales_status,
      rating,
      popularity
    } = req.body;
    
    const existing = await db.get(
      'SELECT * FROM Products WHERE product_id = ?',
      [id]
    );
    
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await db.run(
      `UPDATE Products SET
        name = ?,
        description = ?,
        price = ?,
        stock = ?,
        image_url = ?,
        color = ?,
        size = ?,
        category_id = ?,
        sales_status = ?,
        rating = ?,
        popularity = ?
      WHERE product_id = ?`,
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        price !== undefined ? price : existing.price,
        stock !== undefined ? stock : existing.stock,
        image_url !== undefined ? image_url : existing.image_url,
        color !== undefined ? color : existing.color,
        size !== undefined ? size : existing.size,
        category_id || existing.category_id,
        sales_status !== undefined ? (sales_status ? 1 : 0) : existing.sales_status,
        rating !== undefined ? rating : existing.rating,
        popularity !== undefined ? popularity : existing.popularity,
        id
      ]
    );
    
    const product = await db.get(
      'SELECT * FROM Products WHERE product_id = ?',
      [id]
    );
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await db.get(
      'SELECT * FROM Products WHERE product_id = ?',
      [id]
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await db.run(
      'UPDATE Products SET is_active = 0 WHERE product_id = ?',
      [id]
    );
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

