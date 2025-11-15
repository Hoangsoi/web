import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    referralCode: ''
  })
  const [error, setError] = useState('')
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.referralCode
      )
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
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
            Tạo tài khoản mới
          </h2>
          <p className="text-gray-500 text-sm">
            Mua sắm mọi lúc mọi nơi với trải nghiệm như ứng dụng.
          </p>
        </div>

        <div className="mt-6 bg-white rounded-3xl shadow-2xl shadow-primary/10 p-6 sm:p-8 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Nhập tên đầy đủ"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Ví dụ: 0901 234 567"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mã đại lý được cung cấp
                </label>
                <input
                  type="text"
                  name="referralCode"
                  required
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 uppercase tracking-widest"
                  placeholder="Nhập mã đại lý"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary py-3 text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:bg-secondary transition-colors"
            >
              Đăng ký ngay
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-secondary"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

