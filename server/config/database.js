import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment variables');
  console.error('Please create a .env file in the server directory with:');
  console.error('DATABASE_URL=postgresql://...');
  process.exit(1);
}

console.log('Connecting to database...');
console.log('Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Test connection first
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        referral_code VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        avatar TEXT,
        balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0),
        commission DECIMAL(12, 2) DEFAULT 0 CHECK (commission >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add balance and commission columns if they don't exist (for existing databases)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='balance') THEN
          ALTER TABLE users ADD COLUMN balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='commission') THEN
          ALTER TABLE users ADD COLUMN commission DECIMAL(12, 2) DEFAULT 0 CHECK (commission >= 0);
        END IF;
      END $$;
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        original_price DECIMAL(10, 2) CHECK (original_price >= 0),
        images TEXT[],
        category VARCHAR(100) NOT NULL,
        brand VARCHAR(100),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        num_reviews INTEGER DEFAULT 0,
        seller_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cart_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total_price DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cod',
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        shipping_address JSONB,
        commission_amount DECIMAL(10, 2) DEFAULT 0,
        paid_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add commission_amount column if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='commission_amount') THEN
          ALTER TABLE orders ADD COLUMN commission_amount DECIMAL(10, 2) DEFAULT 0;
        END IF;
      END $$;
    `);

    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        name VARCHAR(255) NOT NULL,
        image TEXT,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity >= 1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table for deposit/withdraw history
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw')),
        amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table for site configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize default settings if not exist
    const defaultSettings = [
      { key: 'referral_code', value: 'SH6688' },
      { key: 'banner_images', value: JSON.stringify([
        'https://www.droppii.com/wp-content/uploads/2023/04/banner-shopee-sieu-sale.png',
        'https://images2.thanhnien.vn/528068263637045248/2023/11/7/12-1699351749473435665166.jpg',
        'https://media.licdn.com/dms/image/v2/D5622AQGhjIFlU5bEiw/feedshare-shrink_800/B56ZnoaepzJoAo-/0/1760540881200?e=2147483647&v=beta&t=dxKCoKKK6muj4jisC1G-DGxBlPMCxoUr8pk24V2t5HY',
        'https://marketingai.mediacdn.vn/wp-content/uploads/2018/11/s2.jpg',
        'https://mainnmedia.com/wp-content/uploads/2025/01/Kich-thuoc-anh-Shopee.jpg'
      ]) },
      { key: 'announcement_texts', value: JSON.stringify([
        '🎉 Miễn phí giao hàng 0đ cho đơn từ 99K',
        '🔥 Ưu đãi Điện tử giảm đến 20%',
        '💎 Cao cấp 50% | VIP nhận quà đặc quyền',
        '📦 Đổi trả miễn phí trong 15 ngày'
      ]) }
    ];

    for (const setting of defaultSettings) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [setting.key, setting.value]
      );
    }

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
    `);

    console.log('Database tables initialized successfully');
    
    // Seed sample products (don't block server startup)
    seedSampleProducts().catch(err => {
      console.error('Error seeding products (non-blocking):', err.message);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Seed sample products
const seedSampleProducts = async () => {
  try {
    // Check if products already exist
    const checkResult = await pool.query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(checkResult.rows[0].count);
    
    if (productCount > 0) {
      console.log('Products already exist, skipping seed');
      return;
    }

    const sampleProducts = [
      // Mỹ phẩm (10% giảm)
      {
        name: 'Kem dưỡng ẩm cao cấp',
        description: 'Kem dưỡng ẩm chuyên sâu, phù hợp mọi loại da. Cung cấp độ ẩm 24h, làm mềm và mịn da.',
        price: 450000,
        originalPrice: 500000,
        images: ['https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Kem+Duong+Am'],
        category: 'Mỹ phẩm',
        brand: 'Beauty Pro',
        stock: 50,
        rating: 4.5,
        numReviews: 128
      },
      {
        name: 'Serum Vitamin C sáng da',
        description: 'Serum chứa Vitamin C tinh khiết, giúp làm sáng da, giảm thâm nám, đều màu da.',
        price: 360000,
        originalPrice: 400000,
        images: ['https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Serum+Vitamin+C'],
        category: 'Mỹ phẩm',
        brand: 'Glow Skin',
        stock: 30,
        rating: 4.7,
        numReviews: 95
      },
      {
        name: 'Mặt nạ đất sét làm sạch',
        description: 'Mặt nạ đất sét tự nhiên, làm sạch sâu lỗ chân lông, kiểm soát dầu thừa.',
        price: 180000,
        originalPrice: 200000,
        images: ['https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Mat+Na+Dat+Set'],
        category: 'Mỹ phẩm',
        brand: 'Pure Nature',
        stock: 80,
        rating: 4.3,
        numReviews: 67
      },
      {
        name: 'Son môi không trôi màu',
        description: 'Son môi lâu trôi, không khô môi, màu sắc bền đẹp suốt ngày dài.',
        price: 270000,
        originalPrice: 300000,
        images: ['https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Son+Moi'],
        category: 'Mỹ phẩm',
        brand: 'Color Stay',
        stock: 100,
        rating: 4.6,
        numReviews: 203
      },
      {
        name: 'Toner cân bằng độ pH',
        description: 'Toner dịu nhẹ, cân bằng độ pH da, se khít lỗ chân lông, chuẩn bị da cho các bước dưỡng tiếp theo.',
        price: 225000,
        originalPrice: 250000,
        images: ['https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Toner'],
        category: 'Mỹ phẩm',
        brand: 'Balance Care',
        stock: 60,
        rating: 4.4,
        numReviews: 89
      },
      
      // Điện tử (20% giảm)
      {
        name: 'Tai nghe Bluetooth chống ồn',
        description: 'Tai nghe không dây chất lượng cao, chống ồn chủ động, pin 30 giờ, âm thanh sống động.',
        price: 2400000,
        originalPrice: 3000000,
        images: ['https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Tai+Nghe+BT'],
        category: 'Điện tử',
        brand: 'SoundMax',
        stock: 25,
        rating: 4.8,
        numReviews: 156
      },
      {
        name: 'Chuột không dây gaming',
        description: 'Chuột gaming độ phân giải cao, phản hồi nhanh, thiết kế ergonomic, pin sử dụng lâu dài.',
        price: 800000,
        originalPrice: 1000000,
        images: ['https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Chuot+Gaming'],
        category: 'Điện tử',
        brand: 'GameTech',
        stock: 40,
        rating: 4.6,
        numReviews: 92
      },
      {
        name: 'Bàn phím cơ RGB',
        description: 'Bàn phím cơ switch Cherry, đèn LED RGB, thiết kế chống nước, phù hợp gaming và làm việc.',
        price: 2400000,
        originalPrice: 3000000,
        images: ['https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Ban+Phim+Co'],
        category: 'Điện tử',
        brand: 'Mechanical Pro',
        stock: 20,
        rating: 4.7,
        numReviews: 134
      },
      {
        name: 'Webcam Full HD 1080p',
        description: 'Webcam chất lượng cao, micro tích hợp, tự động điều chỉnh ánh sáng, phù hợp họp online.',
        price: 1600000,
        originalPrice: 2000000,
        images: ['https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Webcam'],
        category: 'Điện tử',
        brand: 'ClearView',
        stock: 35,
        rating: 4.5,
        numReviews: 78
      },
      {
        name: 'Ổ cứng SSD 1TB',
        description: 'SSD tốc độ cao, đọc/ghi nhanh, tăng hiệu suất máy tính, bền bỉ và tiết kiệm điện.',
        price: 2000000,
        originalPrice: 2500000,
        images: ['https://via.placeholder.com/400x400/4169E1/FFFFFF?text=SSD+1TB'],
        category: 'Điện tử',
        brand: 'SpeedDrive',
        stock: 15,
        rating: 4.9,
        numReviews: 245
      },
      
      // Điện lạnh (30% giảm)
      {
        name: 'Máy lạnh Inverter 1 HP',
        description: 'Máy lạnh tiết kiệm điện, làm lạnh nhanh, công nghệ Inverter, vận hành êm ái.',
        price: 10500000,
        originalPrice: 15000000,
        images: ['https://via.placeholder.com/400x400/00CED1/FFFFFF?text=May+Lanh+1HP'],
        category: 'Điện lạnh',
        brand: 'CoolTech',
        stock: 10,
        rating: 4.6,
        numReviews: 89
      },
      {
        name: 'Tủ lạnh Side by Side 500L',
        description: 'Tủ lạnh dung tích lớn, công nghệ No Frost, tiết kiệm điện, nhiều ngăn tiện lợi.',
        price: 17500000,
        originalPrice: 25000000,
        images: ['https://via.placeholder.com/400x400/00CED1/FFFFFF?text=Tu+Lanh+500L'],
        category: 'Điện lạnh',
        brand: 'FreshCool',
        stock: 8,
        rating: 4.7,
        numReviews: 67
      },
      {
        name: 'Máy giặt cửa trước 9kg',
        description: 'Máy giặt công nghệ mới, tiết kiệm nước và điện, nhiều chế độ giặt, vận hành êm.',
        price: 11200000,
        originalPrice: 16000000,
        images: ['https://via.placeholder.com/400x400/00CED1/FFFFFF?text=May+Giat+9kg'],
        category: 'Điện lạnh',
        brand: 'WashPro',
        stock: 12,
        rating: 4.5,
        numReviews: 112
      },
      {
        name: 'Máy nước nóng lạnh',
        description: 'Máy nước nóng lạnh tiện lợi, làm nóng nhanh, tiết kiệm điện, an toàn khi sử dụng.',
        price: 3500000,
        originalPrice: 5000000,
        images: ['https://via.placeholder.com/400x400/00CED1/FFFFFF?text=May+Nuoc+Nong'],
        category: 'Điện lạnh',
        brand: 'HotWater',
        stock: 20,
        rating: 4.4,
        numReviews: 45
      },
      {
        name: 'Quạt điều hòa không khí',
        description: 'Quạt điều hòa làm mát không khí, tạo độ ẩm, tiết kiệm điện, phù hợp phòng nhỏ.',
        price: 2800000,
        originalPrice: 4000000,
        images: ['https://via.placeholder.com/400x400/00CED1/FFFFFF?text=Quat+Dieu+Hoa'],
        category: 'Điện lạnh',
        brand: 'AirCool',
        stock: 30,
        rating: 4.3,
        numReviews: 56
      },
      
      // Cao cấp (50% giảm)
      {
        name: 'Đồng hồ thông minh cao cấp',
        description: 'Smartwatch đa chức năng, theo dõi sức khỏe, pin lâu, màn hình sắc nét, chống nước.',
        price: 5000000,
        originalPrice: 10000000,
        images: ['https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Smartwatch'],
        category: 'Cao cấp',
        brand: 'Luxury Time',
        stock: 15,
        rating: 4.9,
        numReviews: 234
      },
      {
        name: 'Túi xách da thật cao cấp',
        description: 'Túi xách da thật nhập khẩu, thiết kế sang trọng, bền đẹp, phù hợp công sở và dạo phố.',
        price: 4500000,
        originalPrice: 9000000,
        images: ['https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Tui+Xach+Da'],
        category: 'Cao cấp',
        brand: 'Premium Leather',
        stock: 10,
        rating: 4.8,
        numReviews: 89
      },
      {
        name: 'Kính mát chính hãng',
        description: 'Kính mát chống tia UV, chống chói, thiết kế thời trang, bảo vệ mắt tối ưu.',
        price: 2500000,
        originalPrice: 5000000,
        images: ['https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Kinh+Mat'],
        category: 'Cao cấp',
        brand: 'SunShade',
        stock: 25,
        rating: 4.7,
        numReviews: 145
      },
      {
        name: 'Nước hoa cao cấp 100ml',
        description: 'Nước hoa chính hãng, hương thơm quyến rũ, lưu hương lâu, thiết kế sang trọng.',
        price: 3000000,
        originalPrice: 6000000,
        images: ['https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Nuoc+Hoa'],
        category: 'Cao cấp',
        brand: 'Elite Fragrance',
        stock: 18,
        rating: 4.6,
        numReviews: 167
      },
      {
        name: 'Ví da thật cao cấp',
        description: 'Ví da thật nhập khẩu, nhiều ngăn tiện lợi, thiết kế tinh tế, bền đẹp theo thời gian.',
        price: 2000000,
        originalPrice: 4000000,
        images: ['https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Vi+Da'],
        category: 'Cao cấp',
        brand: 'Premium Wallet',
        stock: 30,
        rating: 4.5,
        numReviews: 98
      },
      
      // VIP
      {
        name: 'iPhone 15 Pro Max 256GB',
        description: 'Điện thoại cao cấp nhất, chip A17 Pro, camera 48MP, màn hình Super Retina, pin lâu dài.',
        price: 30000000,
        originalPrice: 35000000,
        images: ['https://via.placeholder.com/400x400/8B00FF/FFFFFF?text=iPhone+15+Pro'],
        category: 'VIP',
        brand: 'Apple',
        stock: 5,
        rating: 5.0,
        numReviews: 456
      },
      {
        name: 'Laptop cao cấp 16 inch',
        description: 'Laptop màn hình lớn, chip mạnh mẽ, RAM 32GB, SSD 1TB, card đồ họa rời, phù hợp chuyên nghiệp.',
        price: 45000000,
        originalPrice: 50000000,
        images: ['https://via.placeholder.com/400x400/8B00FF/FFFFFF?text=Laptop+16inch'],
        category: 'VIP',
        brand: 'TechPro',
        stock: 3,
        rating: 4.9,
        numReviews: 234
      },
      {
        name: 'TV OLED 65 inch 4K',
        description: 'Smart TV OLED công nghệ mới, màn hình 4K sắc nét, âm thanh vòm, hệ điều hành thông minh.',
        price: 35000000,
        originalPrice: 40000000,
        images: ['https://via.placeholder.com/400x400/8B00FF/FFFFFF?text=TV+OLED+65'],
        category: 'VIP',
        brand: 'UltraVision',
        stock: 8,
        rating: 4.8,
        numReviews: 189
      },
      {
        name: 'Đồng hồ thời trang cao cấp',
        description: 'Đồng hồ thời trang chính hãng, thiết kế sang trọng, máy cơ tự động, chống nước.',
        price: 25000000,
        originalPrice: 30000000,
        images: ['https://via.placeholder.com/400x400/8B00FF/FFFFFF?text=Dong+Ho+VIP'],
        category: 'VIP',
        brand: 'Luxury Watch',
        stock: 6,
        rating: 4.9,
        numReviews: 312
      },
      {
        name: 'Máy ảnh Mirrorless Full Frame',
        description: 'Máy ảnh chuyên nghiệp, cảm biến full frame, quay video 4K, ống kính đi kèm chất lượng cao.',
        price: 40000000,
        originalPrice: 45000000,
        images: ['https://via.placeholder.com/400x400/8B00FF/FFFFFF?text=May+Anh+Pro'],
        category: 'VIP',
        brand: 'PhotoMaster',
        stock: 4,
        rating: 5.0,
        numReviews: 278
      }
    ];

    for (const product of sampleProducts) {
      try {
        await pool.query(
          `INSERT INTO products (name, description, price, original_price, images, category, brand, stock, rating, num_reviews)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            product.name,
            product.description,
            product.price,
            product.originalPrice,
            product.images || [], // Ensure it's an array
            product.category,
            product.brand,
            product.stock,
            product.rating,
            product.numReviews
          ]
        );
      } catch (error) {
        console.error(`Error inserting product "${product.name}":`, error.message);
        // Continue with next product
      }
    }

    console.log(`Seeded ${sampleProducts.length} sample products successfully`);
  } catch (error) {
    console.error('Error seeding sample products:', error);
    // Don't throw error, just log it
  }
};

export default pool;

