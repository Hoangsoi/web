import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/axios'

export default function Checkout() {
  const [cart, setCart] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/api/orders', {
        shippingAddress,
        paymentMethod
      })
      navigate('/orders')
    } catch (error) {
      alert('Lỗi khi đặt hàng: ' + (error.response?.data?.message || error.message))
    } finally {
      setSubmitting(false)
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
            onClick={() => navigate('/products')}
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
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  required
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại *"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Địa chỉ *"
                  required
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Tỉnh/Thành phố"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Quận/Huyện"
                    value={shippingAddress.district}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, district: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Phường/Xã"
                    value={shippingAddress.ward}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, ward: e.target.value })
                    }
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>
                    {item.product?.name} x {item.quantity}
                  </span>
                  <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-xl">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

