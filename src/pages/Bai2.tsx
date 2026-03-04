import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, DatePicker, AutoComplete, Tag, Space, message, Progress } from 'antd';
import moment from 'moment';

const Bai2: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(['Toán', 'Văn', 'Anh', 'Khoa học', 'Công nghệ']);
  const [sessions, setSessions] = useState<any[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(600);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<number>(600);

  const [form] = Form.useForm();

  useEffect(() => {
    const savedSessions = localStorage.getItem('study_sessions');
    if (savedSessions) setSessions(JSON.parse(savedSessions));

    const savedCats = localStorage.getItem('study_categories');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedGoal = localStorage.getItem('study_monthly_goal');
    if (savedGoal) {
      setMonthlyGoal(Number(savedGoal));
      setTempGoal(Number(savedGoal));
    }
  }, []);

  const handleSaveGoal = () => {
    setMonthlyGoal(tempGoal);
    localStorage.setItem('study_monthly_goal', tempGoal.toString());
    setIsEditingGoal(false);
    message.success('Đã cập nhật mục tiêu tháng!');
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      date: moment(record.date, 'YYYY-MM-DD HH:mm')
    });
    setIsModalOpen(true);
  };

  const handleSaveSession = (values: any) => {
    const sessionData = { 
      ...values, 
      date: values.date.format('YYYY-MM-DD HH:mm'),
      month: values.date.format('YYYY-MM')
    };

    if (!categories.includes(values.subject)) {
      const newCats = [...categories, values.subject];
      setCategories(newCats);
      localStorage.setItem('study_categories', JSON.stringify(newCats));
    }
    
    let updated;
    if (editingId) {
      updated = sessions.map(s => s.id === editingId ? { ...s, ...sessionData } : s);
      message.success('Đã cập nhật tiến độ học tập!');
    } else {
      updated = [...sessions, { ...sessionData, id: Date.now() }];
      message.success('Đã thêm lịch học!');
    }

    setSessions(updated);
    localStorage.setItem('study_sessions', JSON.stringify(updated));
    setIsModalOpen(false);
    form.resetFields();
  };

  const deleteSession = (id: number) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('study_sessions', JSON.stringify(updated));
    message.success('Đã xóa lịch học!');
  };

  const currentMonth = moment().format('YYYY-MM');
  const totalDuration = sessions
    .filter(s => s.month === currentMonth)
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  
  const isGoalReached = totalDuration >= monthlyGoal;

  const columns = [
    { title: 'Môn học', dataIndex: 'subject', key: 'subject', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: 'Thời gian', dataIndex: 'date', key: 'date' },
    { title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
    { title: 'Nội dung', dataIndex: 'content', key: 'content' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    { 
      title: 'Hành động', 
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button danger type="link" onClick={() => deleteSession(record.id)}>Xóa</Button>
        </Space>
      )
    },
  ];

  return (
    <Card title="Bài 2: Quản lý học tập & Mục tiêu">
      
      <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h4 style={{ margin: 0 }}>Mục tiêu tháng {currentMonth}: {totalDuration}/{monthlyGoal} phút</h4>
          
          {isEditingGoal ? (
            <Space>
              <InputNumber 
                min={1} 
                value={tempGoal} 
                onChange={(val) => setTempGoal(val || 1)} 
              />
              <Button type="primary" size="small" onClick={handleSaveGoal}>Lưu</Button>
              <Button size="small" onClick={() => setIsEditingGoal(false)}>Hủy</Button>
            </Space>
          ) : (
            <Button type="link" onClick={() => { setIsEditingGoal(true); setTempGoal(monthlyGoal); }}>
              Sửa mục tiêu
            </Button>
          )}
        </div>

        <Progress 
          percent={Math.round((totalDuration / monthlyGoal) * 100)} 
          status={isGoalReached ? 'success' : 'active'} 
        />
        {isGoalReached ? 
          <Tag color="green" style={{ marginTop: 8 }}>Đã đạt mục tiêu tháng!</Tag> : 
          <Tag color="orange" style={{ marginTop: 8 }}>Chưa đạt mục tiêu</Tag>
        }
      </div>

      <Button type="primary" onClick={handleOpenAddModal} style={{ marginBottom: 16 }}>
        Thêm lịch học mới
      </Button>
      
      <Table dataSource={sessions} columns={columns} rowKey="id" />

      <Modal 
        title={editingId ? "Sửa tiến độ học tập" : "Thêm tiến độ học tập"} 
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()}
        okText="Lưu lại"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveSession}>
          <Form.Item name="subject" label="Môn học" rules={[{ required: true, message: 'Hãy chọn hoặc nhập môn!' }]}>
            <AutoComplete
              options={categories.map(cat => ({ value: cat }))}
              placeholder="Chọn hoặc nhập tên môn mới từ bàn phím"
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 10 }}>
            <Form.Item name="date" label="Ngày giờ học" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
            <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="content" label="Nội dung đã học" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input placeholder="Lưu ý thêm, link tài liệu,..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Bai2;