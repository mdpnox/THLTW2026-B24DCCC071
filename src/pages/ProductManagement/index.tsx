import { Table, Tag, Input, Select, Slider, Space, Button, Card, Modal, Form, InputNumber } from 'antd';
import { useModel } from 'umi';
import { useState, useMemo } from 'react';

const ProductManagement = () => {
  const { products, updateProduct } = useModel('useStore');
  const [form] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);


  const showEditModal = (record: any) => {
    console.log('Đang bấm sửa sản phẩm:', record); 
    setEditingId(record.id);
    form.setFieldsValue(record); 
    setIsModalOpen(true); 
  };

  
  const handleUpdate = (values: any) => {
    if (editingId !== null) {
      updateProduct(editingId, values);
      setIsModalOpen(false);
      setEditingId(null);
    }
  };

  const columns = [
    { title: 'STT', render: (_: any, __: any, index: number) => index + 1 },
    { title: 'Tên sản phẩm', dataIndex: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
    { title: 'Danh mục', dataIndex: 'category' },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      render: (v: number) => v.toLocaleString() + ' đ', 
      sorter: (a: any, b: any) => a.price - b.price 
    },
    { title: 'Số lượng', dataIndex: 'quantity', sorter: (a: any, b: any) => a.quantity - b.quantity },
    { 
      title: 'Trạng thái', 
      render: (r: any) => {
        if (r.quantity === 0) return <Tag color="red">Hết hàng</Tag>;
        if (r.quantity <= 10) return <Tag color="orange">Sắp hết</Tag>;
        return <Tag color="green">Còn hàng</Tag>;
      }
    },
    { 
      title: 'Thao tác', 
      render: (record: any) => (
        <Button type="link" onClick={() => showEditModal(record)}>
          Sửa
        </Button>
      ) 
    },
  ];

  // Logic lọc dữ liệu
  const filteredData = useMemo(() => {
    return products.filter((p: any) => {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !cat || p.category === cat;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      let matchStatus = true;
      if (statusFilter === 'Hết hàng') matchStatus = p.quantity === 0;
      else if (statusFilter === 'Sắp hết') matchStatus = p.quantity > 0 && p.quantity <= 10;
      else if (statusFilter === 'Còn hàng') matchStatus = p.quantity > 10;
      return matchName && matchCat && matchPrice && matchStatus;
    });
  }, [products, search, cat, priceRange, statusFilter]);

  return (
    <Card title="Quản lý Sản phẩm">
      <Space wrap style={{ marginBottom: 20 }}>
        <Input placeholder="Tìm tên..." onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
        <Select 
          placeholder="Danh mục" 
          allowClear 
          style={{ width: 140 }} 
          onChange={setCat} 
          options={[...new Set(products.map((p: any) => p.category))].map(c => ({ label: c, value: c }))} 
        />
        <div style={{ width: 180, marginLeft: 10 }}>
          <span style={{ fontSize: 12 }}>Giá: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}</span>
          <Slider range min={0} max={50000000} step={1000000} defaultValue={[0, 50000000]} onAfterChange={setPriceRange} />
        </div>
        <Select placeholder="Trạng thái" allowClear style={{ width: 120 }} onChange={setStatusFilter}>
          <Select.Option value="Còn hàng">Còn hàng</Select.Option>
          <Select.Option value="Sắp hết">Sắp hết</Select.Option>
          <Select.Option value="Hết hàng">Hết hàng</Select.Option>
        </Select>
      </Space>

      <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 5 }} />

      {}
      <Modal 
        title="Chỉnh sửa thông tin sản phẩm" 
        visible={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        okText="Lưu lại"
        cancelText="Hủy"
        destroyOnClose 
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng kho" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManagement;