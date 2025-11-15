import { FiHeadphones, FiPhone, FiMail, FiMessageCircle, FiHelpCircle } from 'react-icons/fi'

export default function Support() {
  const supportOptions = [
    {
      icon: FiMessageCircle,
      title: 'Chat trực tuyến',
      description: 'Nhận hỗ trợ ngay lập tức qua chat',
      action: 'Bắt đầu chat',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FiPhone,
      title: 'Hotline',
      description: '1900-xxxx (Miễn phí)',
      action: 'Gọi ngay',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: FiMail,
      title: 'Email hỗ trợ',
      description: 'support@dailyshopee.com',
      action: 'Gửi email',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: FiHelpCircle,
      title: 'Câu hỏi thường gặp',
      description: 'Tìm câu trả lời nhanh chóng',
      action: 'Xem FAQ',
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  const faqs = [
    {
      question: 'Làm thế nào để đặt hàng?',
      answer: 'Bạn có thể thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Sau khi đặt hàng thành công, bạn sẽ nhận được email xác nhận.'
    },
    {
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thời gian giao hàng từ 2-5 ngày làm việc tùy thuộc vào địa chỉ nhận hàng của bạn.'
    },
    {
      question: 'Có thể đổi trả sản phẩm không?',
      answer: 'Có, bạn có thể đổi trả sản phẩm trong vòng 15 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn.'
    },
    {
      question: 'Phương thức thanh toán nào được chấp nhận?',
      answer: 'Hiện tại chúng tôi hỗ trợ thanh toán khi nhận hàng (COD). Các phương thức thanh toán khác sẽ được cập nhật sớm.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <FiHeadphones size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chăm sóc khách hàng
          </h1>
          <p className="text-gray-600">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {supportOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${option.color} mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <button className="text-primary font-semibold hover:text-secondary transition-colors">
                  {option.action} →
                </button>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

