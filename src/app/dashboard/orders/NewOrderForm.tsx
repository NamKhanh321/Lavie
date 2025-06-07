'use client'
import { useEffect, useState } from 'react';
import { customerService } from '@/services/api/customerService';
import { productService } from '@/services/api/productService';
import { Order, orderService } from '@/services/api/orderService';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

interface Product { _id: string; name: string; price: number; is_returnable: boolean; stock?: number; }
interface Customer { _id: string; name: string; phone: string; address: string; type: 'retail' | 'agency'; }
interface CartItem { product: Product; quantity: number; returnable_quantity?: number; }
type NewOrderFormProps = {
  onOrderCreatedAction: (order: Order) => void
  onCancelAction: () => void
}
export default function NewOrderForm({ onOrderCreatedAction, onCancelAction }: NewOrderFormProps) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const customers = await customerService.getCustomers();
        setCustomers(customers);
        const prods = await productService.getProducts();
        setProducts(prods);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = () => {
    const product = products.find(p => p._id === selectedProductId);
    if (!product || quantity <= 0) return;

    const isAgency = selectedCustomer?.type === 'agency';
    const price = isAgency ? product.price * 0.9 : product.price;

    setCart(prev => {
      const exist = prev.find(item => item.product._id === product._id);
      if (exist) {
        return prev.map(item =>
          item.product._id === product._id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                product: { ...item.product, price }
              }
            : item
        );
      }
      return [...prev, { product: { ...product, price }, quantity }];
    });

    toast.success(`Đã thêm ${product.name} x${quantity} vào giỏ${isAgency ? ' (giảm 10%)' : ''}`);
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleOrder = async () => {
    if (!selectedCustomer) return toast.error('Chọn khách hàng');
    if (cart.length === 0) return toast.error('Giỏ hàng trống');

    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.name,
        orderItems: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          returnable_quantity: item.product.is_returnable ? (item.returnable_quantity || 0) : 0
        })),
        staffId: user?.id,
        staffName: user?.name
      } as any);

      toast.success('Tạo đơn hàng thành công!');
      setCart([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tạo đơn hàng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-center">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
    

      {/* Chọn khách hàng */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Khách hàng</label>
        <select
          value={selectedCustomer?._id || ''}
          onChange={e => {
            const found = customers.find(c => c._id === e.target.value);
            setSelectedCustomer(found || null);
          }}
          className="input w-full"
        >
          <option value="">-- Chọn khách hàng --</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.phone})
            </option>
          ))}
        </select>
      </div>

      {/* Chọn sản phẩm */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium">Sản phẩm</label>
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="input w-full"
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} - {p.price.toLocaleString('vi-VN')} đ
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block mb-1 font-medium">Số lượng</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="input w-full"
          />
        </div>
        <button onClick={handleAddToCart} className="btn btn-primary mt-6">
          Thêm
        </button>
      </div>

      {/* Giỏ hàng */}
      {cart.length > 0 && (
        <div className="mt-6">
          <h2 className="font-medium mb-2">Giỏ hàng</h2>
          <table className="w-full text-sm mb-4 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-2 py-1">Sản phẩm</th>
                <th className="text-left px-2 py-1">SL</th>
                <th className="text-left px-2 py-1">Đơn giá</th>
                <th className="text-left px-2 py-1">Tổng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i}>
                  <td className="px-2 py-1">{item.product.name}</td>
                  <td className="px-2 py-1">{item.quantity}</td>
                  <td className="px-2 py-1">{item.product.price.toLocaleString('vi-VN')} đ</td>
                  <td className="px-2 py-1">
                    {(item.quantity * item.product.price).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-2 py-1 text-red-600 cursor-pointer" onClick={() =>
                    setCart(prev => prev.filter((_, idx) => idx !== i))
                  }>Xóa</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
