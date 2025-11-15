import pool from '../config/database.js';

export const findProducts = async (filters = {}, pagination = {}) => {
  try {
    const { category, search } = filters;
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 12;
    
    let query = 'SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE p.is_active = true';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND p.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count (build separate count query)
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE p.is_active = true';
    const countParams = [];
    let countParamCount = 0;
    
    if (category) {
      countParamCount++;
      countQuery += ` AND p.category = $${countParamCount}`;
      countParams.push(category);
    }
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count) || 0;

    // Add ORDER BY for main query
    query += ' ORDER BY p.created_at DESC';

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((page - 1) * limit);

    const result = await pool.query(query, params);
    
    // Format products
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

    return { products, total };
  } catch (error) {
    console.error('Error in findProducts:', error);
    throw error;
  }
};

export const findProductById = async (id) => {
  const result = await pool.query(
    'SELECT p.*, u.name as seller_name FROM products p LEFT JOIN users u ON p.seller_id = u.id WHERE p.id = $1',
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    _id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    images: row.images || [],
    category: row.category,
    brand: row.brand,
    stock: row.stock,
    rating: parseFloat(row.rating),
    numReviews: row.num_reviews,
    seller: row.seller_id ? { _id: row.seller_id, name: row.seller_name } : null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

export const createProduct = async (productData) => {
  const {
    name,
    description,
    price,
    originalPrice,
    images,
    category,
    brand,
    stock,
    sellerId
  } = productData;

  const result = await pool.query(
    `INSERT INTO products (name, description, price, original_price, images, category, brand, stock, seller_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, description, price, originalPrice || null, images || [], category, brand || null, stock || 0, sellerId]
  );

  return result.rows[0];
};

export const updateProduct = async (id, productData) => {
  const fields = [];
  const values = [];
  let paramCount = 0;

  Object.keys(productData).forEach(key => {
    if (productData[key] !== undefined) {
      paramCount++;
      const dbKey = key === 'originalPrice' ? 'original_price' : 
                    key === 'numReviews' ? 'num_reviews' : 
                    key === 'isActive' ? 'is_active' : 
                    key === 'sellerId' ? 'seller_id' : key;
      fields.push(`${dbKey} = $${paramCount}`);
      values.push(productData[key]);
    }
  });

  if (fields.length === 0) {
    return findProductById(id);
  }

  paramCount++;
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const updateProductStock = async (id, quantity) => {
  const result = await pool.query(
    'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [quantity, id]
  );
  return result.rows[0];
};
