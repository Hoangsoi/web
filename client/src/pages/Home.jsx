import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../config/axios'
import { FiVolume2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Default fallback data
const defaultAnnouncements = [
  '🎉 Miễn phí giao hàng 0đ cho đơn từ 99K',
  '🔥 Ưu đãi Điện tử giảm đến 20%',
  '💎 Cao cấp 50% | VIP nhận quà đặc quyền',
  '📦 Đổi trả miễn phí trong 15 ngày'
]

const defaultBanners = [
  'https://www.droppii.com/wp-content/uploads/2023/04/banner-shopee-sieu-sale.png',
  'https://images2.thanhnien.vn/528068263637045248/2023/11/7/12-1699351749473435665166.jpg',
  'https://media.licdn.com/dms/image/v2/D5622AQGhjIFlU5bEiw/feedshare-shrink_800/B56ZnoaepzJoAo-/0/1760540881200?e=2147483647&v=beta&t=dxKCoKKK6muj4jisC1G-DGxBlPMCxoUr8pk24V2t5HY',
  'https://marketingai.mediacdn.vn/wp-content/uploads/2018/11/s2.jpg',
  'https://mainnmedia.com/wp-content/uploads/2025/01/Kich-thuoc-anh-Shopee.jpg'
]

const spotlightSections = [
  {
    key: 'Mỹ phẩm',
    discount: '10%',
    label: 'Mỹ phẩm 10%',
    gradient: 'from-pink-50 to-white',
    accent: 'bg-pink-100 text-pink-600',
    description: 'Chuẩn spa tại nhà'
  },
  {
    key: 'Điện tử',
    discount: '20%',
    label: 'Điện tử 20%',
    gradient: 'from-blue-50 to-white',
    accent: 'bg-blue-100 text-blue-600',
    description: 'Công nghệ thông minh'
  },
  {
    key: 'Điện lạnh',
    discount: '30%',
    label: 'Điện lạnh 30%',
    gradient: 'from-cyan-50 to-white',
    accent: 'bg-cyan-100 text-cyan-600',
    description: 'Mát lạnh mùa hè'
  },
  {
    key: 'Cao cấp',
    discount: '50%',
    label: 'Cao cấp 50%',
    gradient: 'from-amber-50 to-white',
    accent: 'bg-amber-100 text-amber-600',
    description: 'Đẳng cấp sang trọng'
  },
  {
    key: 'VIP',
    discount: 'Đặc quyền',
    label: 'VIP',
    gradient: 'from-purple-50 to-white',
    accent: 'bg-purple-100 text-purple-600',
    description: 'Ưu đãi giới hạn'
  }
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(spotlightSections[0].key)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [banners, setBanners] = useState(defaultBanners)
  const [announcements, setAnnouncements] = useState(defaultAnnouncements)

  useEffect(() => {
    fetchProducts()
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings')
      if (res.data.banner_images && res.data.banner_images.length > 0) {
        setBanners(res.data.banner_images)
      }
      if (res.data.announcement_texts && res.data.announcement_texts.length > 0) {
        setAnnouncements(res.data.announcement_texts)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Use default values if API fails
    }
  }

  // Auto slide banners
  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 5000) // Change banner every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products?limit=40')
      console.log('Products fetched:', res.data)
      if (res.data && res.data.products) {
        setProducts(res.data.products)
        console.log('Products count:', res.data.products.length)
      } else {
        console.error('Invalid response format:', res.data)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
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

  const groupedProducts = useMemo(() => {
    const groups = {}
    spotlightSections.forEach((section) => {
      const categoryProducts = products.filter(
        (product) => product.category === section.key
      )
      groups[section.key] =
        categoryProducts.length > 0
          ? categoryProducts.slice(0, 4)
          : products.slice(0, 4)
    })
    console.log('Grouped products:', groups)
    return groups
  }, [products])

  const currentSection =
    spotlightSections.find((section) => section.key === activeTab) ||
    spotlightSections[0]

  const featuredProducts = useMemo(() => {
    const featured = products.slice(0, 20)
    console.log('Featured products:', featured.length, featured)
    return featured
  }, [products])

  const nextBanner = () => {
    if (banners.length === 0) return
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    if (banners.length === 0) return
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Banner Slideshow */}
      <section className="relative bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="relative h-64 md:h-80 lg:h-96">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentBannerIndex * 100}%)`
            }}
          >
            {banners.map((bannerUrl, index) => (
              <div
                key={index}
                className="min-w-full h-full relative block flex items-center justify-center overflow-hidden"
              >
                <img
                  src={bannerUrl}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Banner trước"
          >
            <FiChevronLeft size={24} className="text-primary" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Banner tiếp"
          >
            <FiChevronRight size={24} className="text-primary" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBannerIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Announcement Section */}
      <section className="bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="flex items-center gap-3 bg-primary text-white px-4 py-3">
          <div className="p-2 bg-white/20 rounded-full">
            <FiVolume2 size={18} />
          </div>
          <span className="font-semibold text-sm uppercase tracking-widest">
            Thông báo
          </span>
        </div>
        <div className="overflow-hidden relative bg-white">
          <div className="marquee-track flex gap-8 py-3 text-primary font-semibold uppercase tracking-wide text-sm whitespace-nowrap">
            {[...announcements, ...announcements].map((text, index) => (
              <span key={`${text}-${index}`}>{text}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Khu vực ưu đãi theo ngành hàng
          </h2>
          <p className="text-gray-500 text-sm">
            Chạm vào từng tab để xem sản phẩm giảm giá tương ứng.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 no-scrollbar">
            {spotlightSections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveTab(section.key)}
                className={`flex-1 min-w-[140px] px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === section.key
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div
            className={`bg-gradient-to-br ${currentSection.gradient} p-6`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {currentSection.key}{' '}
                  <span className="text-primary">
                    {currentSection.discount}
                  </span>
                </h3>
                <p className="text-gray-500 text-sm">
                  {currentSection.description}
                </p>
              </div>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${currentSection.accent}`}
              >
                Giảm {currentSection.discount}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : !groupedProducts[activeTab] || groupedProducts[activeTab].length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có sản phẩm trong danh mục này
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {groupedProducts[activeTab].map((product) => (
                  <Link
                    key={`${activeTab}-${product._id}`}
                    to={`/products/${product._id}`}
                    className="group rounded-2xl bg-white shadow hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-50">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-base">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có sản phẩm nổi bật
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <Link
                key={`featured-${product._id}`}
                to={`/products/${product._id}`}
                className="group bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-square bg-gray-50">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {formatPrice(product.price)}
                    </span>
                    {product.rating > 0 && (
                      <span className="text-xs text-yellow-500 font-semibold">
                        ★ {product.rating}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

