import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`)
      setProduct(res.data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await axios.post('/api/cart', {
        productId: product._id,
        quantity
      })
      alert('Đã thêm vào giỏ hàng!')
    } catch (error) {
      alert('Lỗi khi thêm vào giỏ hàng')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Không tìm thấy sản phẩm</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {product.rating > 0 && (
              <div className="mb-4">
                <div className="text-yellow-500 text-xl">
                  {'★'.repeat(Math.floor(product.rating))}
                </div>
                <span className="text-gray-600">
                  ({product.numReviews} đánh giá)
                </span>
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-600 mb-2">Số lượng:</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border rounded"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 border rounded"
                >
                  +
                </button>
                <span className="text-gray-600">
                  (Còn {product.stock} sản phẩm)
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">Danh mục: {product.category}</p>
              {product.brand && <p className="text-gray-600">Thương hiệu: {product.brand}</p>}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => {
                  handleAddToCart()
                  navigate('/cart')
                }}
                className="w-full px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
          <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
        </div>
      </div>
    </div>
  )
}

