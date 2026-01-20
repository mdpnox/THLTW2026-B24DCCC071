import React, { useState } from 'react';
import { Table, Card, Button, Space, Typography, Tag, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProductType {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

const ProductList: React.FC = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    const [dataSource, setDataSource] = useState<ProductType[]>([
        { id: '1', name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
        { id: '2', name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
        { id: '3', name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
        { id: '4', name: 'iPad Air M2', price: 18000000, quantity: 12 },
        { id: '5', name: 'MacBook Air M3', price: 28000000, quantity: 8 },
    ]);

    const filteredData = dataSource.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const showModal = () => setIsModalOpen(true);
    
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleDelete = (id: string) => {
        setDataSource(dataSource.filter((item) => item.id !== id));
        message.success('Xóa sản phẩm thành công!');
    };

    const onFinish = (values: any) => {
        const newProduct: ProductType = {
            id: Date.now().toString(),
            ...values,
        };
        setDataSource([...dataSource, newProduct]);
        message.success('Thêm sản phẩm thành công!');
        setIsModalOpen(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 70,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            align: 'center' as const,
            render: (val: number) => (
                <Text type="danger">{val.toLocaleString('vi-VN')} ₫</Text>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center' as const,
            render: (qty: number) => (
                qty > 0 ? <Tag color="blue">{qty}</Tag> : <Tag color="error">Hết hàng</Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: ProductType) => (
                <Space size="middle">
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn xóa "${record.name}" không?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" size="small" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer title="Quản lý sản phẩm">
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Input
                        placeholder="Tìm kiếm theo tên sản phẩm..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                        Thêm sản phẩm
                    </Button>
                </div>

                <Table
                    dataSource={filteredData}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    bordered
                    locale={{ emptyText: 'Không tìm thấy sản phẩm nào' }}
                />

                <Modal
                    title="Thêm sản phẩm mới"
                    visible={isModalOpen}
                    onOk={() => form.submit()}
                    onCancel={handleCancel}
                    okText="Lưu"
                    cancelText="Hủy"
                >
                    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ quantity: 1 }}>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                        >
                            <Input placeholder="Nhập tên sản phẩm" />
                        </Form.Item>

                        <Form.Item
                            label="Giá sản phẩm"
                            name="price"
                            rules={[
                                { required: true, message: 'Vui lòng nhập giá!' },
                                { type: 'number', min: 1, message: 'Giá phải là số dương!' }
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                addonAfter="VND"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Số lượng"
                            name="quantity"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng!' },
                                { 
                                    type: 'number', 
                                    min: 1, 
                                    message: 'Số lượng phải là số nguyên dương!',
                                    transform: (value) => Number(value) 
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} precision={0} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </PageContainer>
    );
};

export default ProductList;