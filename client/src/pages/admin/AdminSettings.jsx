import { useEffect, useState } from 'react'
import api from '../../config/axios'
import { FiSave, FiPlus, FiX } from 'react-icons/fi'

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    referral_code: 'SH6688',
    banner_images: [],
    announcement_texts: []
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings')
      setSettings({
        referral_code: res.data.referral_code || 'SH6688',
        banner_images: res.data.banner_images || [],
        announcement_texts: res.data.announcement_texts || []
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
      alert('Lỗi khi tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put('/api/settings', settings)
      alert('Cập nhật cài đặt thành công!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(error.response?.data?.message || 'Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const handleAddBanner = () => {
    setSettings({
      ...settings,
      banner_images: [...settings.banner_images, '']
    })
  }

  const handleRemoveBanner = (index) => {
    setSettings({
      ...settings,
      banner_images: settings.banner_images.filter((_, i) => i !== index)
    })
  }

  const handleBannerChange = (index, value) => {
    const newBanners = [...settings.banner_images]
    newBanners[index] = value
    setSettings({
      ...settings,
      banner_images: newBanners
    })
  }

  const handleAddAnnouncement = () => {
    setSettings({
      ...settings,
      announcement_texts: [...settings.announcement_texts, '']
    })
  }

  const handleRemoveAnnouncement = (index) => {
    setSettings({
      ...settings,
      announcement_texts: settings.announcement_texts.filter((_, i) => i !== index)
    })
  }

  const handleAnnouncementChange = (index, value) => {
    const newAnnouncements = [...settings.announcement_texts]
    newAnnouncements[index] = value
    setSettings({
      ...settings,
      announcement_texts: newAnnouncements
    })
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50"
        >
          <FiSave size={20} />
          <span>{saving ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Mã đại lý */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mã đại lý</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Mã đại lý</label>
            <input
              type="text"
              value={settings.referral_code}
              onChange={(e) => setSettings({ ...settings, referral_code: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Nhập mã đại lý"
            />
            <p className="text-sm text-gray-500 mt-2">
              Mã này sẽ được yêu cầu khi khách hàng đăng ký tài khoản mới
            </p>
          </div>
        </div>

        {/* Banner slideshow */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Banner slideshow</h2>
            <button
              onClick={handleAddBanner}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <FiPlus size={18} />
              <span>Thêm banner</span>
            </button>
          </div>
          <div className="space-y-4">
            {settings.banner_images.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có banner nào</p>
            ) : (
              settings.banner_images.map((banner, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Banner {index + 1} - URL ảnh
                    </label>
                    <input
                      type="url"
                      value={banner}
                      onChange={(e) => handleBannerChange(index, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="https://example.com/banner.jpg"
                    />
                    {banner && (
                      <div className="mt-3">
                        <img
                          src={banner}
                          alt={`Banner ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveBanner(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thông báo chạy */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Thông báo chạy</h2>
            <button
              onClick={handleAddAnnouncement}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <FiPlus size={18} />
              <span>Thêm thông báo</span>
            </button>
          </div>
          <div className="space-y-4">
            {settings.announcement_texts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có thông báo nào</p>
            ) : (
              settings.announcement_texts.map((announcement, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Thông báo {index + 1}
                    </label>
                    <input
                      type="text"
                      value={announcement}
                      onChange={(e) => handleAnnouncementChange(index, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Nhập nội dung thông báo"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveAnnouncement(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

