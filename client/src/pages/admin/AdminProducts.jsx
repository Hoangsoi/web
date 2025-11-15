import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../config/axios'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    stock: '',
    images: [],
    isActive: true
  })
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (search) params.append('search', search)
      
      const res = await api.get(`/api/admin/products?${params}`)
      setProducts(res.data.products)
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('Lỗi khi tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

    try {
      await api.delete(`/api/admin/products/${id}`)
      alert('Xóa sản phẩm thành công!')
      fetchProducts()
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || '',
      brand: product.brand || '',
      stock: product.stock || '',
      images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
      isActive: product.isActive !== false
    })
    setNewImageUrl('')
    setShowModal(true)
  }

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()]
      })
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        images: Array.isArray(formData.images) ? formData.images.filter(url => url.trim()) : []
      }

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, productData)
        alert('Cập nhật sản phẩm thành công!')
      } else {
        await api.post('/api/products', productData)
        alert('Thêm sản phẩm thành công!')
      }

      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        brand: '',
        stock: '',
        images: [],
        isActive: true
      })
      setNewImageUrl('')
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu sản phẩm')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Quản lý sản phẩm</h1>
        <button
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              originalPrice: '',
              category: '',
              brand: '',
              stock: '',
              images: [],
              isActive: true
            })
            setNewImageUrl('')
            setShowModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
        >
          <FiPlus size={20} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có sản phẩm nào</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hình ảnh</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tồn kho</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/products/${product._id}`}
                        className="font-medium text-gray-900 hover:text-primary"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-gray-700">{product.category || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{product.stock || 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-4 py-2">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="5"
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá gốc</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Danh mục *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="Mỹ phẩm">Mỹ phẩm</option>
                      <option value="Điện tử">Điện tử</option>
                      <option value="Điện lạnh">Điện lạnh</option>
                      <option value="Cao cấp">Cao cấp</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tồn kho *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Tạm dừng</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hình ảnh sản phẩm</label>
                  
                  {/* Add new image URL */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Nhập URL hình ảnh"
                      className="flex-1 px-4 py-2 border rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddImage()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <FiPlus size={20} />
                    </button>
                  </div>

                  {/* Display images */}
                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="hidden w-full h-32 bg-gray-200 rounded-lg border items-center justify-center text-gray-400 text-xs">
                            Lỗi tải ảnh
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 border rounded-lg">
                      Chưa có hình ảnh nào. Thêm URL hình ảnh ở trên.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                    }}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                  >
                    {editingProduct ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

