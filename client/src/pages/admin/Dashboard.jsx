import { useEffect, useState } from 'react'
import api from '../config/axios'
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats')
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Không thể tải dữ liệu</div>
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Tổng sản phẩm',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'bg-green-500'
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'bg-purple-500'
    },
    {
      title: 'Tổng doanh thu',
      value: formatPrice(stats.totalRevenue),
      icon: FiDollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Đơn hàng 7 ngày',
      value: stats.recentOrders,
      icon: FiTrendingUp,
      color: 'bg-indigo-500'
    },
    {
      title: 'Đơn hàng chờ xử lý',
      value: stats.pendingOrders,
      icon: FiClock,
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Tổng quan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow h-full flex flex-col"
            >
              <div className="flex items-start justify-between flex-1">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm mb-2">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 break-words">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full text-white flex-shrink-0 ml-4`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

