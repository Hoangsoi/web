import { useEffect, useState } from 'react'
import api from '../config/axios'
import { FiSearch, FiPlus, FiMinus } from 'react-icons/fi'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustType, setAdjustType] = useState('add') // 'add' or 'subtract'
  const [adjustFormData, setAdjustFormData] = useState({
    userId: '',
    amount: '',
    description: ''
  })
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [page, typeFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const res = await api.get('/api/admin/users?limit=1000')
      setUsers(res.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (typeFilter) params.append('type', typeFilter)
      if (statusFilter) params.append('status', statusFilter)
      
      const res = await api.get(`/api/admin/transactions?${params}`)
      setTransactions(res.data.transactions)
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      alert('Lỗi khi tải giao dịch')
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

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('vi-VN')
  }

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Nạp tiền',
      withdraw: 'Rút tiền'
    }
    return labels[type] || type
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    }
    return labels[status] || status
  }

  const handleAdjustBalance = async (e) => {
    e.preventDefault()
    try {
      if (!adjustFormData.userId || !adjustFormData.amount || parseFloat(adjustFormData.amount) <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin')
        return
      }

      await api.post('/api/admin/transactions/adjust-balance', {
        userId: parseInt(adjustFormData.userId),
        amount: parseFloat(adjustFormData.amount),
        description: adjustFormData.description || `Admin ${adjustType === 'add' ? 'cộng' : 'trừ'} tiền`,
        type: adjustType
      })

      alert(`${adjustType === 'add' ? 'Cộng' : 'Trừ'} tiền thành công!`)
      setShowAdjustModal(false)
      setAdjustFormData({
        userId: '',
        amount: '',
        description: ''
      })
      fetchTransactions()
    } catch (error) {
      console.error('Error adjusting balance:', error)
      alert(error.response?.data?.message || 'Lỗi khi cộng/trừ tiền')
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Quản lý giao dịch</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setAdjustType('add')
              setAdjustFormData({ userId: '', amount: '', description: '' })
              fetchUsers()
              setShowAdjustModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <FiPlus size={20} />
            <span>Cộng tiền</span>
          </button>
          <button
            onClick={() => {
              setAdjustType('subtract')
              setAdjustFormData({ userId: '', amount: '', description: '' })
              fetchUsers()
              setShowAdjustModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FiMinus size={20} />
            <span>Trừ tiền</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tất cả loại</option>
          <option value="deposit">Nạp tiền</option>
          <option value="withdraw">Rút tiền</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có giao dịch nào</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã giao dịch</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Số tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">#{transaction._id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{transaction.user?.name || '-'}</div>
                        <div className="text-sm text-gray-500">{transaction.user?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'deposit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
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

      {/* Adjust Balance Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {adjustType === 'add' ? 'Cộng tiền' : 'Trừ tiền'}
              </h2>
              <form onSubmit={handleAdjustBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn người dùng *</label>
                  {loadingUsers ? (
                    <div className="w-full px-4 py-2 border rounded-lg text-gray-500">
                      Đang tải danh sách người dùng...
                    </div>
                  ) : (
                    <select
                      required
                      value={adjustFormData.userId}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, userId: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">-- Chọn người dùng --</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          ID: {user._id} - {user.name} ({user.email}) - Số dư: {formatPrice(user.balance || 0)}
                        </option>
                      ))}
                    </select>
                  )}
                  {adjustFormData.userId && (
                    <p className="mt-2 text-sm text-gray-500">
                      ID người dùng: <span className="font-mono font-semibold">{adjustFormData.userId}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số tiền (VND) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={adjustFormData.amount}
                    onChange={(e) => setAdjustFormData({ ...adjustFormData, amount: e.target.value })}
                    placeholder="Nhập số tiền"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    value={adjustFormData.description}
                    onChange={(e) => setAdjustFormData({ ...adjustFormData, description: e.target.value })}
                    placeholder={`Mô tả ${adjustType === 'add' ? 'cộng' : 'trừ'} tiền`}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustModal(false)
                      setAdjustFormData({ userId: '', amount: '', description: '' })
                    }}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 text-white rounded-lg hover:opacity-90 ${
                      adjustType === 'add' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {adjustType === 'add' ? 'Cộng tiền' : 'Trừ tiền'}
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

