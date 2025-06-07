'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orderService, Order } from '@/services/api/orderService';
import { customerService } from '@/services/api/customerService';

export default function CustomerOrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user) return;
        const allOrders = await orderService.getOrders();
        const customers = await customerService.getCustomers();
        const customer = customers.find(c => c.userId === user.id);
        const customerOrders = allOrders.filter((order) => order.customerId === customer?._id);
        setOrders(customerOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      } catch (error) {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Lịch sử đặt hàng</h1>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2">Mã đơn</th>
              <th className="px-4 py-2">Ngày đặt</th>
              <th className="px-4 py-2">Vỏ đã trả/Tổng số vỏ</th>
              <th className="px-4 py-2">Tiền cọc vỏ</th>
              <th className="px-4 py-2">Tiền hàng</th>
              <th className="px-4 py-2">Tổng tiền</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">Chưa có đơn hàng nào</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-primary-600 text-center">{order._id}</td>
                  <td className="px-4 py-2 text-center ">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-2 text-center">{order.returnableIn}/{order.returnableOut}</td>
                  <td className="px-4 py-2 text-center">{formatCurrency(order.returnableAmount)}</td>
                  <td className="px-4 py-2 text-center">{formatCurrency((order.totalAmount))}</td>
                  <td className="px-4 py-2 text-center">{formatCurrency(order.totalAmount + order.returnableAmount)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed'
                        ? 'Đã Hoàn Thành bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'completed' ? 'Đã Hoàn Thành' : 'Đang Xử Lý'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 