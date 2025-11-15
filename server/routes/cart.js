import express from 'express';
import { findCartByUserId, addItemToCart, removeItemFromCart, updateCartItemQuantity } from '../models/Cart.js';
import { findProductById } from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    const cart = await findCartByUserId(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await addItemToCart(req.user.id, productId, parseInt(quantity));
    const cart = await findCartByUserId(req.user.id);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    await removeItemFromCart(req.user.id, req.params.id);
    const cart = await findCartByUserId(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    await updateCartItemQuantity(req.user.id, req.params.id, quantity);
    const cart = await findCartByUserId(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

