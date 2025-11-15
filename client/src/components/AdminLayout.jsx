import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Tổng quan' },
    { path: '/admin/products', icon: FiPackage, label: 'Sản phẩm' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Đơn hàng' },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/admin/transactions', icon: FiDollarSign, label: 'Giao dịch' },
    { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto md:h-full
          w-64 flex-shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b md:justify-center">
            <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:ml-0 flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <FiMenu size={24} />
            </button>
            <div className="flex-1 md:flex-none" />
            <Link to="/" className="text-sm text-gray-600 hover:text-primary">
              Về trang chủ
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

