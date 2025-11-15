import express from 'express';
import { body, validationResult } from 'express-validator';
import { findUserByEmail, createUser, comparePassword } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';
import { getSetting } from '../models/Settings.js';

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('referralCode')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập mã đại lý')
    .custom(async (value) => {
      const REFERRAL_CODE = await getSetting('referral_code') || process.env.REFERRAL_CODE || 'SH6688';
      if (value !== REFERRAL_CODE) {
        throw new Error('Mã đã đăng ký, vui lòng nhập mã khác');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, referralCode } = req.body;

    // Check if user already exists
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password,
      phone,
      referralCode
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referral_code,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referral_code,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // Ensure phone is included in response
    const userData = {
      _id: req.user.id,
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || null,
      role: req.user.role,
      referralCode: req.user.referral_code,
      balance: req.user.balance ? parseFloat(req.user.balance) : 0,
      commission: req.user.commission ? parseFloat(req.user.commission) : 0
    };
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/wallet
// @desc    Get wallet information (balance and commission)
// @access  Private
router.get('/wallet', protect, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    res.json({
      balance: parseFloat(user.balance || 0),
      commission: parseFloat(user.commission || 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

