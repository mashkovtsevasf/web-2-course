const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { user_id, status } = req.query;
    
    if (!req.user.roles.includes('admin') && user_id && parseInt(user_id) !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const queryUserId = req.user.roles.includes('admin') ? user_id : req.user.user_id;
    let sql = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM Orders o
      INNER JOIN Users u ON o.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (queryUserId) {
      sql += ' AND o.user_id = ?';
      params.push(queryUserId);
    }
    
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY o.created_at DESC';
    
    const orders = await db.query(sql, params);
    
    for (let order of orders) {
      const items = await db.query(
        'SELECT * FROM OrderItems WHERE order_id = ?',
        [order.order_id]
      );
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await db.get(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM Orders o
      INNER JOIN Users u ON o.user_id = u.user_id
      WHERE o.order_id = ?`,
      [id]
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!req.user.roles.includes('admin') && order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const items = await db.query(
      'SELECT * FROM OrderItems WHERE order_id = ?',
      [id]
    );
    order.items = items;
    
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      items,
      subtotal,
      shipping,
      discount,
      total,
      shipping_address
    } = req.body;
    
    const user_id = req.user.user_id;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const orderNumber = `ORD-${Date.now()}`;
    
    const orderResult = await db.run(
      `INSERT INTO Orders (
        order_number, user_id, subtotal, shipping, discount, total, shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        user_id,
        subtotal || 0,
        shipping || 30.00,
        discount || 0,
        total || 0,
        shipping_address || null
      ]
    );
    
    for (const item of items) {
      await db.run(
        `INSERT INTO OrderItems (
          order_id, product_id, product_name, product_price, quantity, size, color, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.lastID,
          item.product_id || null,
          item.product_name,
          item.product_price,
          item.quantity,
          item.size || null,
          item.color || null,
          item.subtotal || (item.product_price * item.quantity)
        ]
      );
    }
    
    const order = await db.get(
      'SELECT * FROM Orders WHERE order_id = ?',
      [orderResult.lastID]
    );
    
    const orderItems = await db.query(
      'SELECT * FROM OrderItems WHERE order_id = ?',
      [orderResult.lastID]
    );
    order.items = orderItems;
    
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await db.get(
      'SELECT * FROM Orders WHERE order_id = ?',
      [id]
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await db.run(
      'UPDATE Orders SET status = ? WHERE order_id = ?',
      [status, id]
    );
    
    const updatedOrder = await db.get(
      'SELECT * FROM Orders WHERE order_id = ?',
      [id]
    );
    
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
