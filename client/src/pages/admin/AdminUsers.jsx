import { useEffect, useState } from 'react'
import api from '../config/axios'
import { FiSearch, FiEdit } from 'react-icons/fi'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user'
  })

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      
      const res = await api.get(`/api/admin/users?${params}`)
      setUsers(res.data.users)
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Lỗi khi tải người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Xử lý dữ liệu trước khi gửi
      const submitData = {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role || undefined
      }

      // Loại bỏ các trường undefined
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key]
        }
      })

      await api.put(`/api/admin/users/${editingUser._id}`, submitData)
      alert('Cập nhật người dùng thành công!')
      setShowModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert(error.response?.data?.message || 'Lỗi khi cập nhật người dùng')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('vi-VN')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có người dùng nào</div>
      ) : (
        <>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vai trò</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Số dư</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hoa hồng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày đăng ký</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600 font-mono text-sm">{user._id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(user.balance)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(user.commission)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FiEdit size={18} />
                      </button>
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

      {/* Edit Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Sửa người dùng</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vai trò</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>
                {/* Thông tin chỉ xem - Số dư và Hoa hồng */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin tài chính (Chỉ xem)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">Số dư (VND)</label>
                      <div className="w-full px-4 py-2 bg-white border rounded-lg text-gray-900 font-semibold">
                        {formatPrice(editingUser.balance || 0)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">Hoa hồng (VND)</label>
                      <div className="w-full px-4 py-2 bg-white border rounded-lg text-gray-900 font-semibold">
                        {formatPrice(editingUser.commission || 0)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingUser(null)
                    }}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                  >
                    Cập nhật
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

