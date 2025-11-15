import pool from '../config/database.js';

export const findCartByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT ci.*, 
            p.id as product_id, p.name as product_name, p.price as product_price, 
            p.images as product_images, p.stock as product_stock, p.category as product_category
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );

  const items = result.rows.map(row => ({
    _id: row.id,
    product: {
      _id: row.product_id,
      name: row.product_name,
      price: parseFloat(row.product_price),
      images: row.product_images || [],
      stock: row.product_stock,
      category: row.product_category
    },
    quantity: row.quantity,
    createdAt: row.created_at
  }));

  return {
    user: userId,
    items
  };
};

export const addItemToCart = async (userId, productId, quantity = 1) => {
  // Check if item already exists
  const existing = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );

  if (existing.rows.length > 0) {
    // Update quantity
    const result = await pool.query(
      'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, userId, productId]
    );
    return result.rows[0];
  } else {
    // Insert new item
    const result = await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [userId, productId, quantity]
    );
    return result.rows[0];
  }
};

export const removeItemFromCart = async (userId, itemId) => {
  const result = await pool.query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
    [itemId, userId]
  );
  return result.rows[0];
};

export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const result = await pool.query(
    'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
    [quantity, itemId, userId]
  );
  return result.rows[0];
};

export const clearCart = async (userId) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};
