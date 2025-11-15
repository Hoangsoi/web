import express from 'express';
import { findOrdersByUserId, findOrderById, createOrder } from '../models/Order.js';
import { findCartByUserId, clearCart } from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const orders = await findOrdersByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await findCartByUserId(req.user.id);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total price and prepare order items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images[0] ? product.images[0] : '',
        price: product.price,
        quantity: item.quantity,
        category: product.category // Include category for commission calculation
      });
    }

    const order = await createOrder({
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      totalPrice
    });

    // Clear cart
    await clearCart(req.user.id);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

