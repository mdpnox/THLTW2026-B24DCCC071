import { useState, useEffect } from 'react';
import { message } from 'antd';

const initialProducts = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initialOrders = [
  {
    id: 'DH001',
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }],
    totalAmount: 25000000,
    status: 'Chờ xử lý',
    createdAt: '2024-01-15',
  },
];

export default function useStore() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const updateProduct = (id: number, updatedValues: any) => {
    setProducts((prev: any) =>
      prev.map((p: any) => (p.id === id ? { ...p, ...updatedValues } : p))
    );
    message.success('Cập nhật sản phẩm thành công!');
  };

  const addOrder = (newOrder: any) => {
    setOrders((prev: any) => [newOrder, ...prev]);
    message.success('Tạo đơn hàng thành công!');
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prevOrders: any[]) => {
      const orderIndex = prevOrders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) return prevOrders;

      const order = prevOrders[orderIndex];
      const oldStatus = order.status;

      if (oldStatus === newStatus) return prevOrders;

      if (newStatus === 'Hoàn thành') {
        setProducts((prevProds: any[]) =>
          prevProds.map((p) => {
            const item = order.products.find((op: any) => op.productId === p.id);
            return item ? { ...p, quantity: p.quantity - item.quantity } : p;
          })
        );
        message.info('Đã trừ số lượng tồn kho');
      } 
      else if (newStatus === 'Đã hủy' && oldStatus === 'Hoàn thành') {
        setProducts((prevProds: any[]) =>
          prevProds.map((p) => {
            const item = order.products.find((op: any) => op.productId === p.id);
            return item ? { ...p, quantity: p.quantity + item.quantity } : p;
          })
        );
        message.warning('Đã hoàn trả số lượng về kho');
      }

      const newOrders = [...prevOrders];
      newOrders[orderIndex] = { ...order, status: newStatus };
      return newOrders;
    });
  };

  return { 
    products, 
    setProducts, 
    updateProduct, 
    orders, 
    setOrders, 
    addOrder, 
    updateOrderStatus 
  };
}