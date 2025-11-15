import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import {
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiSearch
} from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [desktopSearch, setDesktopSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (keyword) => {
    if (!keyword.trim()) return
    navigate(`/products?search=${encodeURIComponent(keyword.trim())}`)
  }

  const AuthActions = () => {
    if (user) {
      return (
        <div className="flex items-center space-x-4">
          <Link
            to="/cart"
            className="flex items-center space-x-2 rounded-full px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FiShoppingCart className="text-lg" />
            <span>Giỏ hàng</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-2 rounded-full px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FiUser className="text-lg" />
            <span className="truncate max-w-[120px]">{user.name}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-full px-4 py-2 bg-white text-primary font-semibold hover:bg-gray-100 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="px-5 py-2 rounded-full border border-white/40 hover:bg-white/10 transition-colors text-center"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 rounded-full bg-white text-primary font-semibold shadow-md text-center"
        >
          Đăng ký
        </Link>
      </div>
    )
  }

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight"
            >
              Đại Lý Shopee
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch(desktopSearch)
              }}
              className="relative w-full"
            >
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={desktopSearch}
                onChange={(e) => setDesktopSearch(e.target.value)}
                placeholder="Tìm sản phẩm mong muốn..."
                className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </form>
          </div>

          <div className="hidden md:block">
            <AuthActions />
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <Link
              to="/cart"
              className="relative rounded-full p-2 hover:bg-white/10 transition-colors"
              aria-label="Giỏ hàng"
            >
              <FiShoppingCart size={20} />
            </Link>
          </div>
        </div>

      </div>
    </nav>
  )
}

