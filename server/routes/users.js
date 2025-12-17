const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await db.query(`
      SELECT 
        u.*,
        GROUP_CONCAT(r.role_name) as roles
      FROM Users u
      LEFT JOIN UserRoles ur ON u.user_id = ur.user_id
      LEFT JOIN Roles r ON ur.role_id = r.role_id
      WHERE u.is_active = 1
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (req.user.user_id !== parseInt(id) && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await db.get(
      'SELECT * FROM Users WHERE user_id = ? AND is_active = 1',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const roles = await db.query(`
      SELECT r.role_name
      FROM UserRoles ur
      INNER JOIN Roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = ?
    `, [id]);
    
    user.roles = roles.map(r => r.role_name);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;
    
    if (req.user.user_id !== parseInt(id) && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const existing = await db.get(
      'SELECT * FROM Users WHERE user_id = ?',
      [id]
    );
    
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.run(
      'UPDATE Users SET name = ?, phone = ?, address = ? WHERE user_id = ?',
      [
        name || existing.name,
        phone !== undefined ? phone : existing.phone,
        address !== undefined ? address : existing.address,
        id
      ]
    );
    
    const user = await db.get(
      'SELECT * FROM Users WHERE user_id = ?',
      [id]
    );
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await db.get(
      'SELECT * FROM Users WHERE user_id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.run(
      'UPDATE Users SET is_active = 0 WHERE user_id = ?',
      [id]
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
