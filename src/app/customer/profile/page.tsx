'use client'
import { useAuth } from '@/contexts/AuthContext';
import {useState, useEffect} from 'react';
import {customerService, Customer, CustomerCreate} from '@/services/api/customerService';
import {updateUser, UpdateUserRequest} from '@/services/api/userService';

export default function CustomerProfilePage() {
  const { user, setUser } = useAuth();
  const [customers, setCustomers] = useState<Customer | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<{name?: string, phone?: string; address?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  useEffect( () => {
    fetchCustomer(user?.id || '');
  },[]);

  const fetchCustomer = async (id: string) => {
    try {
    const Customers = await customerService.getCustomers();
    const Customer = Customers.find (c => c.userId == id);
    setCustomers(Customer ?? null);
    }
    catch (error) {
      console.error('Lỗi khi lấy thông tin khách hàng:', error);
    }
  }
  // hàm sửa profile khách hàng
  const handleUpdateProfile = async (updatedData: Partial<CustomerCreate>) => {
    console.log({...updatedData, type: customers?.type || 'retail'})
    await customerService.updateCustomer(customers?._id || '', {...updatedData, type: customers?.type || 'retail'});
    if(updatedData.name)
    {
      if(user)
      setUser({
        id: user.id,
        name: updatedData.name,
        username: user.username,
        role: user.role
      })
    }
    fetchCustomer(user?.id || '');
  }

  const validateEditData = () => {
  if (!editData.name || editData.name.trim() === '') {
    return 'Tên người dùng không được để trống';
  }
  if (!editData.phone || editData.phone.trim() === '') {
    return 'Số điện thoại không được để trống';
  }
  if (!editData.address || editData.address.trim() === '') {
    return 'Địa chỉ không được để trống';
  }
  if (editData.phone.length < 10 || !editData.phone.startsWith('0')) {
    return 'Số điện thoại không hợp lệ';
  }
  return null;
};


  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Thông tin tài khoản</h1>
      <div className="space-y-4">
        <div>
          <span className="font-medium text-gray-700">Tên khách hàng:</span>
          <span className="ml-2 text-gray-900">{customers?.name}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Tên đăng nhập:</span>
          <span className="ml-2 text-gray-900">{user?.username}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Vai trò:</span>
          <span className="ml-2 text-gray-900">Khách hàng</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Loại khách hàng:</span>
          <span className="ml-2 text-gray-900">{customers?.type === 'retail' ? 'Khách hàng lẻ' : 'Đại lý cấp 2'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Số điện thoại:</span>
          <span className="ml-2 text-gray-900">{customers?.phone}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Địa chỉ:</span>
          <span className="ml-2 text-gray-900">{customers?.address}</span>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <button
                  onClick={() => {
                    setEditData({ name: customers?.name || '', phone: customers?.phone || '', address: customers?.address || '' });
                    setShowModal(true);
                  }}
                  className="btn btn-primary flex items-center"
                >
                  Sửa thông tin
                </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Cập nhật thông tin</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
              <input
                type="text"
                className="mt-1 block w-full border rounded px-3 py-2"
                value={editData.name}
                onChange={e => {
                  const value = e.target.value.replace(/[*|\":<>[\]{}`\\()';@&$]/g, '')
                  setEditData({ ...editData, name: value })
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="text" maxLength={10} 
                className="mt-1 block w-full border rounded px-3 py-2"
                value={editData.phone}
                onChange={e => {
                  const value = e.target.value.replace(/[\De-]/g, '').slice(0,10); // Chỉ cho phép số, max 10 ký tự
                  setEditData({ ...editData, phone: value })
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                className="mt-1 block w-full border rounded px-3 py-2"
                value={editData.address}
                onChange={e => {
                  const value = e.target.value.replace(/[*|\":<>[\]{}`\\()';@&$]/g, '')
                  setEditData({ ...editData, address: value })
                }}
              />
            </div>
            {formError && (
            <div className="mb-2 text-red-600 text-sm">{formError}</div>)}
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  const error = validateEditData();
                  if (error) {
                    setFormError(error);
                    return;
                  }
                  setFormError(null);
                  await handleUpdateProfile(editData);
                  setShowModal(false);
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Nếu muốn thêm chức năng đổi mật khẩu, có thể bổ sung form ở đây */}
    </div>
  );
} 