import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../config/axios'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    fetchProducts()
  }, [search, page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('page', page)

      const res = await api.get(`/api/products?${params}`)
      setProducts(res.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => {
            setSearchParams({
              ...Object.fromEntries(searchParams),
              search: e.target.value,
              page: 1
            })
          }}
          className="w-full px-4 py-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-square bg-gray-100">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-primary font-bold text-lg">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.rating > 0 && (
                  <div className="mt-2 text-yellow-500">
                    {'★'.repeat(Math.floor(product.rating))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

