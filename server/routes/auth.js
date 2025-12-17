const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken, authenticate } = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone, address } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if active user exists
    const activeUser = await db.get(
      'SELECT * FROM Users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    // If active user exists, return error
    if (activeUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Check if inactive user exists (for reactivation)
    const inactiveUser = await db.get(
      'SELECT * FROM Users WHERE email = ? AND is_active = 0',
      [email]
    );
    
    let userId;
    let user;
    
    if (inactiveUser) {
      // Reactivate deleted user with new password and data
      const passwordHash = await bcrypt.hash(password, 10);
      
      await db.run(
        'UPDATE Users SET password_hash = ?, name = ?, phone = ?, address = ?, is_active = 1 WHERE user_id = ?',
        [passwordHash, name, phone || null, address || null, inactiveUser.user_id]
      );
      
      userId = inactiveUser.user_id;
      
      // Check if user has roles, if not, add user role
      const existingRoles = await db.query(
        'SELECT role_id FROM UserRoles WHERE user_id = ?',
        [userId]
      );
      
      if (existingRoles.length === 0) {
        const userRole = await db.get(
          "SELECT role_id FROM Roles WHERE role_name = 'user'"
        );
        
        if (userRole) {
          await db.run(
            'INSERT INTO UserRoles (user_id, role_id) VALUES (?, ?)',
            [userId, userRole.role_id]
          );
        }
      }
      
      user = await db.get(
        'SELECT user_id, email, name, phone, address, created_at FROM Users WHERE user_id = ?',
        [userId]
      );
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(password, 10);
      
      const result = await db.run(
        'INSERT INTO Users (email, password_hash, name, phone, address) VALUES (?, ?, ?, ?, ?)',
        [email, passwordHash, name, phone || null, address || null]
      );
      
      userId = result.lastID;
      
      const userRole = await db.get(
        "SELECT role_id FROM Roles WHERE role_name = 'user'"
      );
      
      if (userRole) {
        await db.run(
          'INSERT INTO UserRoles (user_id, role_id) VALUES (?, ?)',
          [userId, userRole.role_id]
        );
      }
      
      user = await db.get(
        'SELECT user_id, email, name, phone, address, created_at FROM Users WHERE user_id = ?',
        [userId]
      );
    }
    
    const userRoles = ['user'];
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      roles: userRoles
    });
    
    await db.run(
      `INSERT INTO Sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES (?, ?, datetime('now', '+24 hours'), ?, ?)`,
      [user.user_id, token, req.ip || 'unknown', req.get('user-agent') || 'unknown']
    );
    
    res.status(201).json({
      token,
      user: {
        ...user,
        roles: userRoles
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Handle UNIQUE constraint error - try to reactivate inactive user
    if (error.message && error.message.includes('UNIQUE constraint')) {
      try {
        const existing = await db.get(
          'SELECT * FROM Users WHERE email = ?',
          [email]
        );
        
        if (existing && existing.is_active === 0) {
          console.log('Attempting to reactivate inactive user:', email);
          const passwordHash = await bcrypt.hash(password, 10);
          await db.run(
            'UPDATE Users SET password_hash = ?, name = ?, phone = ?, address = ?, is_active = 1 WHERE user_id = ?',
            [passwordHash, name, phone || null, address || null, existing.user_id]
          );
          
          const user = await db.get(
            'SELECT user_id, email, name, phone, address, created_at FROM Users WHERE user_id = ?',
            [existing.user_id]
          );
          
          const userRoles = ['user'];
          const token = generateToken({
            user_id: user.user_id,
            email: user.email,
            roles: userRoles
          });
          
          await db.run(
            `INSERT INTO Sessions (user_id, token, expires_at, ip_address, user_agent)
             VALUES (?, ?, datetime('now', '+24 hours'), ?, ?)`,
            [user.user_id, token, req.ip || 'unknown', req.get('user-agent') || 'unknown']
          );
          
          return res.status(201).json({
            token,
            user: {
              ...user,
              roles: userRoles
            }
          });
        }
      } catch (reactivateError) {
        console.error('Reactivation error:', reactivateError);
      }
      
      return res.status(409).json({ error: 'User already exists' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await db.get(
      'SELECT * FROM Users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const roles = await db.query(`
      SELECT r.role_name
      FROM UserRoles ur
      INNER JOIN Roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = ?
    `, [user.user_id]);
    
    await db.run(
      'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [user.user_id]
    );
    
    const userRoles = roles.map(r => r.role_name);
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      roles: userRoles
    });
    
    await db.run(
      `INSERT INTO Sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES (?, ?, datetime('now', '+24 hours'), ?, ?)`,
      [user.user_id, token, req.ip || 'unknown', req.get('user-agent') || 'unknown']
    );
    
    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        roles: userRoles
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const token = req.headers.authorization.substring(7);
    await db.run(
      'DELETE FROM Sessions WHERE token = ?',
      [token]
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
