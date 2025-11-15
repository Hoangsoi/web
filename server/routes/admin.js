import express from 'express';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { protect, admin } from '../middleware/auth.js';
import { findProducts, findProductById, createProduct, updateProduct } from '../models/Product.js';
import { findOrderById } from '../models/Order.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
    const totalUsers = parseInt(usersResult.rows[0].count) || 0;

    // Get total products
    const productsResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count) || 0;

    // Get total orders
    const ordersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count) || 0;

    // Get total revenue
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status = $1',
      ['delivered']
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

    // Get recent orders count (last 7 days)
    const recentOrdersResult = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE created_at >= NOW() - INTERVAL \'7 days\''
    );
    const recentOrders = parseInt(recentOrdersResult.rows[0].count) || 0;

    // Get pending orders count
    const pendingOrdersResult = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE status = $1',
      ['pending']
    );
    const pendingOrders = parseInt(pendingOrdersResult.rows[0].count) || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      pendingOrders
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products (including inactive)
// @access  Private/Admin
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    let query = 'SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
    }

    // Get total count
    const countQuery = query.replace('SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id', 'SELECT COUNT(*) FROM products p');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count) || 0;

    // Add pagination
    query += ' ORDER BY p.created_at DESC';
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limitNum);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((pageNum - 1) * limitNum);

    const result = await pool.query(query, params);

    const products = result.rows.map(row => ({
      _id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price) || 0,
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
      category: row.category,
      brand: row.brand,
      stock: row.stock || 0,
      rating: parseFloat(row.rating) || 0,
      numReviews: row.num_reviews || 0,
      seller: row.seller_id ? { _id: row.seller_id, name: row.seller_name } : null,
      isActive: row.is_active !== false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    let query = `
      SELECT o.*, 
             u.name as user_name, u.email as user_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product', oi.product_id,
                   'name', oi.name,
                   'image', oi.image,
                   'price', oi.price,
                   'quantity', oi.quantity
                 )
               ) FILTER (WHERE oi.id IS NOT NULL),
               '[]'::json
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    query += ' GROUP BY o.id, u.name, u.email';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as count
      FROM orders o
      WHERE 1=1 ${status ? `AND o.status = $1` : ''}
    `;
    const countParams = status ? [status] : [];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count) || 0;

    // Add pagination
    query += ' ORDER BY o.created_at DESC';
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limitNum);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((pageNum - 1) * limitNum);

    const result = await pool.query(query, params);

    const orders = result.rows.map(row => ({
      _id: row.id,
      user: {
        _id: row.user_id,
        name: row.user_name,
        email: row.user_email
      },
      items: Array.isArray(row.items) ? row.items : [],
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      paymentMethod: row.payment_method,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      paidAt: row.paid_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      orders,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await client.query('BEGIN');

    // Get order details
    const orderResult = await client.query(
      'SELECT user_id, total_price, commission_amount, status FROM orders WHERE id = $1',
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const oldStatus = order.status;
    const userId = order.user_id;
    const totalPrice = parseFloat(order.total_price);
    const commissionAmount = parseFloat(order.commission_amount) || 0;

    // Only process refund if status is changing to delivered or cancelled
    if (oldStatus !== status) {
      if (status === 'delivered') {
        // Approve: Refund original price + commission
        const refundAmount = totalPrice + commissionAmount;
        
        // Add money back to user balance
        await client.query(
          'UPDATE users SET balance = balance + $1, commission = commission + $2 WHERE id = $3',
          [totalPrice, commissionAmount, userId]
        );

        // Create transaction record for refund
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'deposit',
            refundAmount,
            `Hoàn tiền đơn hàng #${req.params.id} (Tiền gốc + Hoa hồng)`,
            'completed'
          ]
        );
      } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
        // Reject: Only refund original price (no commission)
        await client.query(
          'UPDATE users SET balance = balance + $1 WHERE id = $2',
          [totalPrice, userId]
        );

        // Create transaction record for refund
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'deposit',
            totalPrice,
            `Hoàn tiền đơn hàng #${req.params.id} (Chỉ tiền gốc)`,
            'completed'
          ]
        );
      }
    }

    // Update order status
    const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];

    if (status === 'delivered') {
      updateFields.push('delivered_at = CURRENT_TIMESTAMP');
    }

    params.push(req.params.id);

    await client.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${params.length}`,
      params
    );

    await client.query('COMMIT');

    const updatedOrder = await findOrderById(req.params.id);
    res.json(updatedOrder);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    let query = 'SELECT id, name, email, phone, address, role, balance, commission, referral_code, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    // Get total count
    const countQuery = query.replace('SELECT id, name, email, phone, role, balance, commission, referral_code, created_at FROM users', 'SELECT COUNT(*) FROM users');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count) || 0;

    // Add pagination
    query += ' ORDER BY created_at DESC';
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limitNum);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((pageNum - 1) * limitNum);

    const result = await pool.query(query, params);

    const users = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      role: row.role,
      balance: parseFloat(row.balance) || 0,
      commission: parseFloat(row.commission) || 0,
      referralCode: row.referral_code,
      createdAt: row.created_at
    }));

    res.json({
      users,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, address, password, role, balance, commission } = req.body;
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      fields.push(`name = $${paramCount}`);
      values.push(name);
    }

    if (email !== undefined) {
      paramCount++;
      fields.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (phone !== undefined) {
      paramCount++;
      fields.push(`phone = $${paramCount}`);
      values.push(phone);
    }

    if (address !== undefined) {
      paramCount++;
      fields.push(`address = $${paramCount}`);
      values.push(address);
    }

    if (password !== undefined && password !== null && password !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      paramCount++;
      fields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
    }

    if (role !== undefined) {
      paramCount++;
      fields.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (balance !== undefined && balance !== null && balance !== '') {
      paramCount++;
      fields.push(`balance = $${paramCount}`);
      values.push(parseFloat(balance));
    }

    if (commission !== undefined && commission !== null && commission !== '') {
      paramCount++;
      fields.push(`commission = $${paramCount}`);
      values.push(parseFloat(commission));
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    paramCount++;
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, phone, address, role, balance, commission, referral_code, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      balance: parseFloat(user.balance) || 0,
      commission: parseFloat(user.commission) || 0,
      referralCode: user.referral_code,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    // Build WHERE conditions
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      whereConditions.push(`t.type = $${paramCount}`);
      params.push(type);
    }

    if (status) {
      paramCount++;
      whereConditions.push(`t.status = $${paramCount}`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM transactions t ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count) || 0;

    // Build main query
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
    `;

    // Add pagination
    query += ' ORDER BY t.created_at DESC';
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limitNum);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((pageNum - 1) * limitNum);

    const result = await pool.query(query, params);

    const transactions = result.rows.map(row => ({
      _id: row.id,
      user: {
        _id: row.user_id,
        name: row.user_name,
        email: row.user_email
      },
      type: row.type,
      amount: parseFloat(row.amount) || 0,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      transactions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/transactions/adjust-balance
// @desc    Admin adjust user balance (add or subtract money)
// @access  Private/Admin
router.post('/transactions/adjust-balance', async (req, res) => {
  try {
    const { userId, amount, description, type } = req.body; // type: 'add' or 'subtract'

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'User ID and valid amount are required' });
    }

    if (!type || (type !== 'add' && type !== 'subtract')) {
      return res.status(400).json({ message: 'Type must be "add" or "subtract"' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current user balance
      const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }

      const currentBalance = parseFloat(userResult.rows[0].balance) || 0;
      const adjustmentAmount = parseFloat(amount);
      let newBalance;

      if (type === 'add') {
        newBalance = currentBalance + adjustmentAmount;
      } else {
        // subtract
        newBalance = currentBalance - adjustmentAmount;
        if (newBalance < 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: 'Số dư không đủ để trừ' });
        }
      }

      // Update user balance
      await client.query(
        'UPDATE users SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, userId]
      );

      // Create transaction record
      const transactionType = type === 'add' ? 'deposit' : 'withdraw';
      const transactionResult = await client.query(
        'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, transactionType, adjustmentAmount, description || `Admin ${type === 'add' ? 'cộng' : 'trừ'} tiền`, 'completed']
      );

      await client.query('COMMIT');

      res.json({
        message: `${type === 'add' ? 'Cộng' : 'Trừ'} tiền thành công`,
        transaction: transactionResult.rows[0],
        newBalance
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adjusting balance:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

