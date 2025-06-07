'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { deleteUser, updateUser, User } from '@/services/api/userService'
// import orderService, { Order } from '@/services/api/orderService'

import Swal from 'sweetalert2';

import {customerService, Customer} from '@/services/api/customerService';
import { title } from 'process'

// type Customer = {
//   _id: string
//   name: string
//   type: 'retail' | 'agency'
//   phone: string
//   address: string
//   debt: number
//   empty_debt: number
//   createdAt: string
// }

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'retail' | 'agency'>('all')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'retail' as 'retail' | 'agency',
    phone: '',
    address: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      // const customers = users.filter(u => u.role === 'customer')
      const customerList: Customer[] = await customerService.getCustomers();
      // Lấy tất cả orders
      // const orders: Order[] = await orderService.getOrders()
      // // Map user -> customer FE, tính debt và empty_debt
      // const customerList: Customer[] = customers.map(u => {
      //   const userOrders = orders.filter((o: Order) => o.customerId === u._id || (typeof o.customerId === 'object' && (o.customerId as any)._id === u._id))
      //   // Tổng công nợ = tổng debtRemaining các đơn chưa thanh toán
      //   const debt = userOrders.reduce((sum: number, o: Order) => sum + (o.debtRemaining || 0), 0)
      //   // Tổng vỏ nợ = tổng (returnableOut - returnableIn) các đơn chưa trả hết vỏ
      //   const empty_debt = userOrders.reduce((sum: number, o: Order) => sum + ((o.returnableOut || 0) - (o.returnableIn || 0)), 0)
      //   return {
      //     _id: u._id,
      //     name: u.name,
      //     type: u.type,
      //     phone: u.phone,
      //     address: u.address,
      //     debt,
      //     empty_debt,
      //     userId: u.userId,
      //     createdAt: u.createdAt || '',
      //   }
      // })
      setCustomers(customerList)
    } catch (err) {
      toast.error('Không thể tải danh sách khách hàng')
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would be an API call
    const newCustomer: Customer = await customerService.createCustomer(formData);
    // For now, just simulate adding to the list
    // const newCustomer: Customer = {
    //   _id: Math.random().toString(36).substring(2, 9),
    //   name: formData.name,
    //   type: formData.type as 'retail' | 'agency',
    //   phone: formData.phone,
    //   address: formData.address,
    //   debt: 0,
    //   empty_debt: 0,
    //   createdAt: new Date().toISOString()
    // }

    setCustomers([...customers, newCustomer])
    resetForm()
    setShowAddModal(false)
    toast.success('Thêm khách hàng thành công')
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomer) return

    // In a real app, this would be an API call
    const updatedCustomers = await customerService.updateCustomer(selectedCustomer._id,formData);
    // For now, just simulate updating the list
    // const updatedCustomers = customers.map(customer =>
    //   customer._id === selectedCustomer._id
    //     ? {
    //       ...customer,
    //       name: formData.name,
    //       type: formData.type as 'retail' | 'agency',
    //       phone: formData.phone,
    //       address: formData.address,
    //     }
    //     : customer
    // )

    setCustomers(customers.map(customer => (customer._id === selectedCustomer._id) ? updatedCustomers : customer));
    resetForm()
    setShowEditModal(false)
    toast.success('Cập nhật khách hàng thành công')
  }

  const handleDeleteCustomer = async (id: string) => {

    // In a real app, this would be an API call
    // Check xem customer hiện tại có tài khoản nào không
    const customer = customers.find(c => c._id === id);
    if(customer?.userId)
    {
      // Xóa tài khoản liên kết
    // if (!confirm('Khách hàng này có liên kết với một tài khoản, tài khoản đó cũng sẽ bị xóa, bạn có muốn tiếp tục không?')) return
      const result = await Swal.fire({
      title: "<strong>Cảnh Báo</strong>",
      icon: "warning",
      html: `
        Khách hàng này có liên kết với một tài khoản,
        tài khoản đó cũng sẽ bị xóa.
        Bạn có muốn tiếp tục không?
      `,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: `
        Tôi hiểu và muốn tiếp tục!
      `,
      cancelButtonText: `
        Hủy
      `,
      });
      if (!result.isConfirmed) return
      try{
        await deleteUser(customer.userId);
      }
      catch (error) {
        toast.error('Không thể xóa tài khoản liên kết với khách hàng này')
        return
      }
    }
    else 
    {
      // if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) return
      const result = await Swal.fire({
      title: "<strong>Cảnh Báo</strong>",
      icon: "warning",
      html: `
        Bạn có chắc chắn muốn xóa khách hàng này không?
      `,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: `
        OK
      `,
      cancelButtonText: `
        Hủy
      `,
      });
      if (!result.isConfirmed) return
    }
    try {
      await customerService.deleteCustomer(id);
    }
    catch (error) {
      toast.error('Không thể xóa khách hàng này')
    }

    // For now, just simulate removing from the list
    setCustomers(customers.filter(customer => customer._id !== id))
    toast.success('Xóa khách hàng thành công')
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      type: customer.type,
      phone: customer.phone,
      address: customer.address,
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'retail',
      phone: '',
      address: ''
    })
    setSelectedCustomer(null)
  }

  // Lọc và tìm kiếm khách hàng
  const filteredCustomers = customers.filter((c) => {
    // Lọc theo loại
    if (filterType !== 'all' && c.type !== filterType) return false;
    // Tìm kiếm theo tên hoặc số điện thoại
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search) ||
      (c.phone && c.phone.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý khách hàng</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          Thêm khách hàng
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                className="input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'retail' | 'agency')}
              >
                <option value="all">Tất cả</option>
                <option value="retail">Khách lẻ</option>
                <option value="agency">Đại lý cấp 2</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Liên hệ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Địa chỉ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Công nợ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vỏ nợ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.type === 'agency'
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {customer.type === 'agency'
                              ? `Đại lý cấp 2`
                              : 'Khách lẻ'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{customer.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${customer.debt > 0 ? 'text-red-500' : 'text-green-500 dark:text-gray-400'
                            }`}>
                            {customer.debt > 0
                              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.debt)
                              : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(customer.debt))
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${customer.empty_debt > 0 ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {customer.empty_debt} vỏ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(customer)}
                              className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer._id)}
                              className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Không tìm thấy khách hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thêm khách hàng mới</h2>

            <form onSubmit={handleAddCustomer}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Tên khách hàng</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input"
                    placeholder="Nhập tên khách hàng"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="label">Loại khách hàng</label>
                  <select
                    id="type"
                    name="type"
                    className="input"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="retail">Khách lẻ</option>
                    <option value="agency">Đại lý cấp 2</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="label">Số điện thoại</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="input"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="label">Địa chỉ</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="input"
                    placeholder="Nhập địa chỉ"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm()
                    setShowAddModal(false)
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Thêm khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chỉnh sửa khách hàng</h2>

            <form onSubmit={handleEditCustomer}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Tên khách hàng</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input"
                    placeholder="Nhập tên khách hàng"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="label">Loại khách hàng</label>
                  <select
                    id="type"
                    name="type"
                    className="input"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="retail">Khách lẻ</option>
                    <option value="agency">Đại lý cấp 2</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="label">Số điện thoại</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="input"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="label">Địa chỉ</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="input"
                    placeholder="Nhập địa chỉ"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm()
                    setShowEditModal(false)
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
