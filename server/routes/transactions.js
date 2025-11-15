import express from 'express';
import { protect } from '../middleware/auth.js';
import { findTransactionsByUserId, createTransaction } from '../models/Transaction.js';
import pool from '../config/database.js';

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await findTransactionsByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transactions/deposit
// @desc    Create a deposit transaction
// @access  Private
router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    // Create transaction
    const transaction = await createTransaction({
      userId: req.user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      description: description || 'Nạp tiền vào ví'
    });

    // Update user balance (for now, auto-complete the transaction)
    await pool.query(
      'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, req.user.id]
    );

    // Update transaction status to completed
    await pool.query(
      'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['completed', transaction.id]
    );

    res.status(201).json({
      ...transaction,
      status: 'completed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transactions/withdraw
// @desc    Create a withdraw transaction
// @access  Private
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    // Check if user has enough balance
    const userResult = await pool.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    const currentBalance = parseFloat(userResult.rows[0].balance || 0);

    if (currentBalance < amount) {
      return res.status(400).json({ message: 'Số dư không đủ' });
    }

    // Create transaction
    const transaction = await createTransaction({
      userId: req.user.id,
      type: 'withdraw',
      amount: parseFloat(amount),
      description: description || 'Rút tiền từ ví'
    });

    // Update user balance (for now, auto-complete the transaction)
    await pool.query(
      'UPDATE users SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, req.user.id]
    );

    // Update transaction status to completed
    await pool.query(
      'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['completed', transaction.id]
    );

    res.status(201).json({
      ...transaction,
      status: 'completed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

