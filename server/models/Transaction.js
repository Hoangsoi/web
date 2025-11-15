import pool from '../config/database.js';

export const findTransactionsByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const createTransaction = async (transactionData) => {
  const { userId, type, amount, description } = transactionData;
  const result = await pool.query(
    'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, type, amount, description || null, 'pending']
  );
  return result.rows[0];
};

export const updateTransactionStatus = async (transactionId, status) => {
  const result = await pool.query(
    'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, transactionId]
  );
  return result.rows[0];
};

