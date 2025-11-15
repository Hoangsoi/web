import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const userData = await login(email, password)
      // Điều hướng dựa trên role
      if (userData?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-white">
      <div className="max-w-md mx-auto px-4 pt-8 pb-12 sm:pt-12">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
            Đại Lý Shopee
          </p>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-500 text-sm">
            Đăng nhập để tiếp tục trải nghiệm mua sắm như trên ứng dụng.
          </p>
        </div>

        <div className="mt-6 bg-white rounded-3xl shadow-2xl shadow-primary/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between bg-primary/5 rounded-2xl px-4 py-3 text-sm text-gray-600">
            <span>Nhập email & mật khẩu đã đăng ký</span>
            <Link
              to="/register"
              className="text-primary font-semibold"
            >
              Đăng ký
            </Link>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                placeholder="example@gmail.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary py-3 text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:bg-secondary transition-colors"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Bằng việc tiếp tục, bạn đồng ý với{' '}
            <span className="text-primary font-medium">Điều khoản</span> &
            <span className="text-primary font-medium"> Chính sách</span> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  )
}

