import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { FiCreditCard, FiTrendingUp, FiArrowDownCircle, FiArrowUpCircle, FiLogOut } from 'react-icons/fi'

export default function Profile() {
  const { user, logout, fetchUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [walletData, setWalletData] = useState({
    balance: 0,
    commission: 0
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || null
      })
      updateWalletDataFromUser()
    }
  }, [user])

  // Update wallet data when user data changes (from AuthContext polling)
  useEffect(() => {
    if (user) {
      updateWalletDataFromUser()
    }
  }, [user?.balance, user?.commission])

  const updateWalletDataFromUser = () => {
    if (user) {
      setWalletData({
        balance: user.balance || 0,
        commission: user.commission || 0
      })
    }
  }

  const refreshWalletData = async () => {
    try {
      setLoading(true)
      // Fetch latest user data from server
      if (fetchUser) {
        await fetchUser(false) // Explicit refresh, not silent
      } else {
        // Fallback: fetch directly
        const response = await axios.get('/api/auth/me')
        setWalletData({
          balance: response.data.balance || 0,
          commission: response.data.commission || 0
        })
      }
    } catch (error) {
      console.error('Error refreshing wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maskPhone = (phone) => {
    if (!phone || phone === null || phone === undefined) return 'Chưa cập nhật'
    const phoneStr = String(phone)
    if (phoneStr.length <= 3) return phoneStr
    const lastThree = phoneStr.slice(-3)
    const masked = '*'.repeat(phoneStr.length - 3)
    return masked + lastThree
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeposit = async () => {
    const amount = prompt('Nhập số tiền muốn nạp (VND):')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Số tiền không hợp lệ')
      return
    }

    try {
      await axios.post('/api/transactions/deposit', {
        amount: parseFloat(amount),
        description: 'Nạp tiền vào ví'
      })
      alert('Nạp tiền thành công!')
      refreshWalletData() // Refresh wallet data
      if (fetchUser) await fetchUser() // Also refresh user context
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền')
    }
  }

  const handleWithdraw = async () => {
    const amount = prompt('Nhập số tiền muốn rút (VND):')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Số tiền không hợp lệ')
      return
    }

    try {
      await axios.post('/api/transactions/withdraw', {
        amount: parseFloat(amount),
        description: 'Rút tiền từ ví'
      })
      alert('Rút tiền thành công!')
      refreshWalletData() // Refresh wallet data
      if (fetchUser) await fetchUser() // Also refresh user context
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi rút tiền')
    }
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Đang tải...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>
      <div className="max-w-2xl">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 px-4 py-3 text-center font-semibold transition-colors ${
                activeTab === 'account'
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tài khoản
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 px-4 py-3 text-center font-semibold transition-colors ${
                activeTab === 'wallet'
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Ví & Hoa hồng
            </button>
          </div>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={maskPhone(formData.phone)}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Ví & Hoa hồng</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : (
              <>
                {/* Số dư ví */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FiCreditCard size={24} />
                      <span className="text-sm opacity-90">Số dư ví</span>
                    </div>
                    <button
                      onClick={refreshWalletData}
                      className="text-xs opacity-75 hover:opacity-100 underline"
                    >
                      Làm mới
                    </button>
                  </div>
                  <div className="text-3xl font-bold">
                    {formatPrice(user?.balance || walletData.balance || 0)}
                  </div>
                </div>

                {/* Hoa hồng */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FiTrendingUp size={24} />
                      <span className="text-sm opacity-90">Tổng hoa hồng</span>
                    </div>
                    <button
                      onClick={refreshWalletData}
                      className="text-xs opacity-75 hover:opacity-100 underline"
                    >
                      Làm mới
                    </button>
                  </div>
                  <div className="text-3xl font-bold">
                    {formatPrice(user?.commission || walletData.commission || 0)}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDeposit}
                className="flex flex-col items-center justify-center p-4 border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <FiArrowDownCircle size={32} className="mb-2 text-primary" />
                <span className="font-semibold">Nạp tiền</span>
              </button>
              <button
                onClick={handleWithdraw}
                className="flex flex-col items-center justify-center p-4 border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <FiArrowUpCircle size={32} className="mb-2 text-primary" />
                <span className="font-semibold">Rút tiền</span>
              </button>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <FiLogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

