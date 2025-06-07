'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService, Product } from '@/services/api/productService';
import { orderService } from '@/services/api/orderService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import {customerService, Customer} from '@/services/api/customerService';

export default function CustomerOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number; returnable_quantity?: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnableIn, setReturnableIn] = useState(0); //Long fix

  const [isAgency, setIsAgency] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        // Kiểm tra xem người dùng có phải là đại lý hay không
        const customer = (await customerService.getCustomers()).find(c => c.userId === user?.id);
        if (customer)
        {
          setCustomer(customer);
          if (customer.type === 'agency') {
          setIsAgency(true);
          }
        }
        
      } catch (error) {
        toast.error('Lỗi khi tải sản phẩm');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
    
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product._id === product._id);
      if (found) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const updateReturnableQuantity = (productId: string, value: number) => {
    setCart((prev) => {
      const newCart = prev.map((item) =>
        item.product._id === productId ? { ...item, returnable_quantity: Math.max(0, Math.min(value, item.quantity)) } : item
      );
  
      // Tính tổng returnableIn mới
      const totalReturnable = newCart.reduce((sum, item) => sum + (item.returnable_quantity || 0), 0);
      setReturnableIn(totalReturnable);
  
      return newCart;
    });
  };
  

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const handleOrder = async () => {
    if (!user) return;
    if (cart.length === 0) {
      toast.warning('Vui lòng chọn sản phẩm');
      return;
    }
    setIsSubmitting(true);
    try {
      const DEPOSIT_UNIT = 20000;

        // Tính tổng số vỏ trả về (nếu chưa có sẵn)
        const returnableIn = cart.reduce((sum, item) => {
          if (item.product.is_returnable) {
            return sum + (item.returnable_quantity || 0);
          }
          return sum;
        }, 0);

        const rawTotalAmount = cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      
        // Tổng tiền thực tế phải trả = tổng tiền hàng - tiền vỏ trả về
        const totalAmount = rawTotalAmount - returnableIn * DEPOSIT_UNIT;
      
      if(customer)
      {
      
      const orderData = {
        customerId: customer._id,
        orderItems: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          total: item.product.price * item.quantity,
          returnable_quantity: item.product.is_returnable ? (item.returnable_quantity || 0) : undefined,
        })),
        paidAmount: 0,
        totalAmount,
        depositAmount: 0,
        returnableIn, // Gửi tổng số vỏ trả về
      };
      await orderService.createOrder(orderData);
      toast.success('Đặt hàng thành công!');
      setCart([]);
      setReturnableIn(0);
      router.push('/customer/order-history');
      }
    } catch (error: any) {
      toast.error('Lỗi khi đặt hàng: ' + (error.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Đặt hàng mới</h1>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <img
                  src={product.image || '/no-image.png'}
                  alt={product.name}
                  className="w-24 h-24 object-contain mb-2 bg-gray-100 rounded"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.png'; }}
                />
                <div className="font-medium text-lg mb-2 text-gray-900 text-center">{product.name}</div>
                <div className="mb-2 text-gray-700">Giá: {(product.price * (isAgency ? 0.9: 1))?.toLocaleString('vi-VN')} đ</div>
                <div className="mb-2 text-gray-700">Số hàng còn: {product.stock}</div>
                <button
                  className="btn btn-primary text-white font-semibold"
                  onClick={() => addToCart(product)}
                >
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Giỏ hàng</h2>
            {cart.length === 0 ? (
              <div className="text-gray-500">Chưa có sản phẩm nào trong giỏ</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-gray-900">Sản phẩm</th>
                    <th className="px-4 py-2 text-gray-900">Số lượng</th>
                    <th className="px-4 py-2 text-gray-900">Thành tiền</th>
                    {/* <th className="px-4 py-2 text-gray-900">Vỏ trả</th> */}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product._id}>
                      <td className="px-4 py-2 text-gray-700 text-center">{item.product.name}</td>
                      <td className="px-4 py-2 text-gray-700 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, Number(e.target.value))}
                          className="w-16 border rounded px-2 py-1 text-gray-900 text-center"
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-700 text-center">{(((item.product.price * item.quantity) - ((item.returnable_quantity || 0) * 20000)) * (isAgency ? 0.9: 1)).toLocaleString('vi-VN')} đ</td>
                      {/* <td className="px-4 py-2 text-gray-700 text-center">
                        {item.product.is_returnable ? (
                          <input
                            type="number"
                            min={0}
                            max={item.quantity}
                            value={item.returnable_quantity || 0}
                            onChange={(e) => updateReturnableQuantity(item.product._id, Number(e.target.value))}
                            className="w-16 border rounded px-2 py-1 text-gray-900"
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td> */}
                      <td className="px-4 py-2">
                        <button className="text-red-600" onClick={() => removeFromCart(item.product._id)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleOrder}
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 