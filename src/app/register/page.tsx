'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaUser, FaLock, FaWater, FaUserTag, FaPhone, FaAddressBook } from 'react-icons/fa'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [address, setAdress] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password || !name || !address || !phone) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (!phone.startsWith('0') || phone.length < 10) {
      toast.error('Số điện thoại không hợp lệ')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          username, 
          password, 
          name,
          role: 'customer' // Default role for new users
        }),
      })
      
      const data = await response.json()
      
    
      // Tạo Customer tương ứng với user role customer
      const response2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}` // Sử dụng token từ đăng ký
        },
        body: JSON.stringify({ 
          name: data.name,
          userId: data._id, // Lưu ID người dùng để liên kết
          type: 'retail', // Mặc định là khách lẻ
          phone,
          address
        }),
      })
      if (!response.ok && !response2.ok) {
        throw new Error(data.message || 'Đăng ký thất bại')
      } else{
        toast.success('Đăng ký thành công')
      }
      

      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi đăng ký')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-700 to-primary-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
          <div className="w-16 h-16 relative">
            <Image src="/uploads/logo.png" alt="Lavie Water Logo" layout="fill" objectFit="contain" />
              
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LAVIE WATER</h1>
          <p className="mt-2 text-gray-600">Đăng ký tài khoản mới</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTag className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input pl-10"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[*|\":<>[\]{}`\\()';@&$]/g, '')
                    setName(value)}}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số Điện Thoại
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="number"
                  required
                  className="input pl-10"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[\De-]/g, '').slice(0,10); // Chỉ cho phép số, max 10 ký tự
                    setPhone(value)}}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaAddressBook className="text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="input pl-10"
                  placeholder="Nhập địa chỉ"
                  value={address}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[*|\":<>[\]{}`\\()';@&$]/g, '')
                    setAdress(value)}}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input pl-10"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9_.-]/g, '')
                    setUsername(value)}}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // mật khẩu không cần lọc ký tự đặc biệt
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mb-2">Đã có tài khoản? <Link href="/login" className="text-primary-600 hover:text-primary-800">Đăng nhập</Link></p>
          <p>© 2025 Lavie Water Management System</p>
        </div>
      </div>
    </div>
  )
}
