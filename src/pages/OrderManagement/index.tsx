import { Table, Button, Card, Modal, Form, Input, Select, InputNumber, Space, DatePicker, Tag } from 'antd';
import { useModel } from 'umi';
import { useState } from 'react';
import moment from 'moment';

const OrderManagement = () => {
  const { orders, products, addOrder, updateOrderStatus } = useModel('useStore');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const calculateTotal = (selectedProds: any[]) => {
    if (!selectedProds) return 0;
    return selectedProds.reduce((sum, item) => {
      const p = products.find((prod: any) => prod.id === item.productId);
      return sum + (p ? p.price * (item.quantity || 0) : 0);
    }, 0);
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (v: number) => v.toLocaleString(), sorter: (a:any, b:any) => a.totalAmount - b.totalAmount },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (status: string, record: any) => (
        <Select value={status} onChange={(val) => updateOrderStatus(record.id, val)} style={{ width: 130 }}>
          <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
          <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
          <Select.Option value="Đã hủy">Đã hủy</Select.Option>
        </Select>
      )
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', sorter: (a: any, b: any) => moment(a.createdAt).unix() - moment(b.createdAt).unix() }
  ];

  return (
    <Card title="Quản lý Đơn hàng" extra={<Button type="primary" onClick={() => setIsModalOpen(true)}>Tạo đơn hàng</Button>}>
      <Table columns={columns} dataSource={orders} rowKey="id" />

      <Modal title="Tạo đơn hàng mới" visible={isModalOpen} width={700} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={(v) => {
            const newOrder = {
                id: `DH${Date.now()}`,
                ...v,
                totalAmount: calculateTotal(v.products),
                createdAt: moment().format('YYYY-MM-DD'),
                status: 'Chờ xử lý'
            };
            addOrder(newOrder);
            setIsModalOpen(false);
            form.resetFields();
        }}>
          <Space>
            <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, pattern: /^[0-9]{10,11}$/, message: '10-11 số' }]}><Input /></Form.Item>
          </Space>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}><Input /></Form.Item>

          <Form.List name="products" rules={[{ validator: async (_, names) => { if (!names || names.length < 1) return Promise.reject(new Error('Chọn ít nhất 1 SP')); } }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true }]}>
                      <Select placeholder="Chọn SP" style={{ width: 200 }}>
                        {products.map((p: any) => <Select.Option key={p.id} value={p.id} disabled={p.quantity === 0}>{p.name} (Kho: {p.quantity})</Select.Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const pId = getFieldValue(['products', name, 'productId']);
                                const p = products.find((prod: any) => prod.id === pId);
                                if (p && value > p.quantity) return Promise.reject(`Max: ${p.quantity}`);
                                return Promise.resolve();
                            }
                        })
                    ]}>
                      <InputNumber placeholder="Số lượng" min={1} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} type="link" danger>Xóa</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>+ Thêm sản phẩm</Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
};
export default OrderManagement;