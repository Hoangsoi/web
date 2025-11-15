import pool from '../config/database.js';

export const findOrdersByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT o.*, 
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
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId]
  );

  return result.rows.map(row => ({
    _id: row.id,
    user: row.user_id,
    items: Array.isArray(row.items) ? row.items : [],
    shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
    paymentMethod: row.payment_method,
    totalPrice: parseFloat(row.total_price),
    commissionAmount: parseFloat(row.commission_amount) || 0,
    status: row.status,
    paidAt: row.paid_at,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

export const findOrderById = async (orderId) => {
  const result = await pool.query(
    `SELECT o.*, 
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
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.id = $1
     GROUP BY o.id`,
    [orderId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    _id: row.id,
    user: row.user_id,
    items: Array.isArray(row.items) ? row.items : [],
    shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
    paymentMethod: row.payment_method,
    totalPrice: parseFloat(row.total_price),
    commissionAmount: parseFloat(row.commission_amount) || 0,
    status: row.status,
    paidAt: row.paid_at,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// Calculate commission based on category
const calculateCommission = (category, price) => {
  const commissionRates = {
    'Mỹ phẩm': 0.10,      // 10%
    'Điện tử': 0.20,      // 20%
    'Điện lạnh': 0.30,    // 30%
    'Cao cấp': 0.50,      // 50%
    'VIP': 0.60           // 60% (đặc quyền)
  };
  
  const rate = commissionRates[category] || 0;
  return price * rate;
};

export const createOrder = async (orderData) => {
  const { userId, items, shippingAddress, paymentMethod, totalPrice } = orderData;

  // Start transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check user balance
    const userResult = await client.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userBalance = parseFloat(userResult.rows[0].balance) || 0;

    if (userBalance < totalPrice) {
      throw new Error('Insufficient balance');
    }

    // Calculate total commission for this order
    let totalCommission = 0;

    // Calculate commission based on items (category is included in item data)
    for (const item of items) {
      // If category is provided in item, use it; otherwise fetch from database
      let category = item.category;
      
      if (!category) {
        const productResult = await client.query(
          'SELECT category FROM products WHERE id = $1',
          [item.product]
        );
        if (productResult.rows.length > 0) {
          category = productResult.rows[0].category;
        }
      }

      if (category) {
        const itemTotal = item.price * item.quantity;
        const commission = calculateCommission(category, itemTotal);
        totalCommission += commission;
      }
    }

    // Create order with commission amount first to get order ID
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_price, payment_method, shipping_address, commission_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, totalPrice, paymentMethod || 'cod', JSON.stringify(shippingAddress), totalCommission]
    );

    const order = orderResult.rows[0];
    const orderId = order.id;

    // Deduct money from user balance
    await client.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [totalPrice, userId]
    );

    // Create transaction record for payment
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'withdraw',
        totalPrice,
        `Thanh toán đơn hàng #${orderId}`,
        'completed'
      ]
    );

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, image, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.product, item.name, item.image || '', item.price, item.quantity]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product]
      );
    }

    await client.query('COMMIT');
    
    return await findOrderById(orderId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
