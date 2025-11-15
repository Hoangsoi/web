import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/axios'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`)
      fetchCart()
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm')
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await api.put(`/api/cart/${itemId}`, { quantity: newQuantity })
      fetchCart()
    } catch (error) {
      alert('Lỗi khi cập nhật số lượng')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0
    return cart.items.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity
      }
      return total
    }, 0)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center border-b p-4 last:border-b-0"
              >
                <div className="w-24 h-24 bg-gray-100 rounded mr-4 flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.product?.name}</h3>
                  <p className="text-primary font-bold">
                    {formatPrice(item.product?.price || 0)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mx-4">
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    className="px-3 py-1 border rounded"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-primary">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tổng kết</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

