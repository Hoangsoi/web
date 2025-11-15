import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiPackage, FiClock, FiHeadphones, FiUser } from 'react-icons/fi'

export default function BottomNavbar() {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      label: 'Trang chủ',
      icon: FiHome
    },
    {
      path: '/orders',
      label: 'Đơn hàng',
      icon: FiPackage
    },
    {
      path: '/history',
      label: 'Lịch sử',
      icon: FiClock
    },
    {
      path: '/support',
      label: 'CSKH',
      icon: FiHeadphones
    },
    {
      path: '/profile',
      label: 'Của tôi',
      icon: FiUser
    }
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              <Icon size={22} className={active ? 'mb-1' : 'mb-1'} />
              <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

