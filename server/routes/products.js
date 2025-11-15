import express from 'express';
import { findProducts, findProductById, createProduct, updateProduct } from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    
    console.log('GET /api/products - params:', { category, search, page: pageNum, limit: limitNum });
    
    const result = await findProducts(
      { category, search },
      { page: pageNum, limit: limitNum }
    );

    console.log('Products found:', result.products.length, 'Total:', result.total);

    res.json({
      products: result.products || [],
      totalPages: Math.ceil((result.total || 0) / limitNum),
      currentPage: pageNum,
      total: result.total || 0
    });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await findProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await createProduct({
      ...req.body,
      sellerId: req.user.id
    });
    res.status(201).json(await findProductById(product.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(await findProductById(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

