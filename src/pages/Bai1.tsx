import React, { useState, useEffect, useMemo } from 'react';
import {
  Tabs, Card, Row, Col, Statistic, Table, Tag, Button,
  Modal, Form, Input, Select, DatePicker, Space, Popconfirm, message
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import dayjs, { Dayjs } from 'dayjs';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  priority: Priority;
  tags: string[];
}

const LOCAL_STORAGE_KEY = 'my_tasks_data';

const STATUS_MAP: Record<TaskStatus, { label: string; color: string }> = {
  'todo': { label: 'Cần làm', color: 'default' },
  'in-progress': { label: 'Đang làm', color: 'processing' },
  'done': { label: 'Hoàn thành', color: 'success' },
};

const PRIORITY_MAP: Record<Priority, { label: string; color: string }> = {
  'high': { label: 'Cao', color: 'red' },
  'medium': { label: 'Trung bình', color: 'orange' },
  'low': { label: 'Thấp', color: 'green' },
};

export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => 
      t.status !== 'done' && dayjs(t.deadline).isBefore(dayjs(), 'day')
    ).length;
    return { total, done, overdue };
  }, [tasks]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      form.setFieldsValue({
        ...task,
        deadline: dayjs(task.deadline)
      });
    } else {
      setEditingTask(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    message.success('Đã xóa công việc!');
  };

  const handleFinish = (values: any) => {
    const newTaskData: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      name: values.name,
      description: values.description || '',
      status: editingTask ? editingTask.status : 'todo',
      deadline: values.deadline.toISOString(),
      priority: values.priority,
      tags: values.tags || [],
    };

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? newTaskData : t));
      message.success('Cập nhật công việc thành công!');
    } else {
      setTasks(prev => [newTaskData, ...prev]);
      message.success('Thêm công việc thành công!');
    }
    setIsModalOpen(false);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      setTasks(prev => prev.map(t => {
        if (t.id === draggableId) {
          return { ...t, status: destination.droppableId as TaskStatus };
        }
        return t;
      }));
    }
  };

  const DashboardTab = () => (
    <div style={{ padding: '20px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng số Task" value={stats.total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Đã hoàn thành" value={stats.done} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Quá hạn" value={stats.overdue} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const KanbanTab = () => {
    const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '16px', padding: '20px 0', alignItems: 'flex-start' }}>
          {columns.map(status => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      flex: 1,
                      background: snapshot.isDraggingOver ? '#e6f7ff' : '#f0f2f5',
                      padding: '16px',
                      borderRadius: '8px',
                      minHeight: '400px'
                    }}
                  >
                    <h3 style={{ marginBottom: '16px', textTransform: 'uppercase' }}>
                      {STATUS_MAP[status].label} ({columnTasks.length})
                    </h3>
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: 'none',
                              padding: '16px',
                              margin: '0 0 8px 0',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.1)',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{task.name}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                              Hạn: {dayjs(task.deadline).format('DD/MM/YYYY')}
                            </div>
                            <Space size={[0, 4]} wrap>
                              <Tag color={PRIORITY_MAP[task.priority].color}>{PRIORITY_MAP[task.priority].label}</Tag>
                              {task.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                            </Space>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    );
  };

  const ListTab = () => {
    const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()));

    const columns = [
      {
        title: 'Tên Task',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        filters: [
          { text: 'Cần làm', value: 'todo' },
          { text: 'Đang làm', value: 'in-progress' },
          { text: 'Hoàn thành', value: 'done' },
        ],
        onFilter: (value: any, record: Task) => record.status === value,
        render: (status: TaskStatus) => (
          <Tag color={STATUS_MAP[status].color}>{STATUS_MAP[status].label}</Tag>
        ),
      },
      {
        title: 'Mức độ ưu tiên',
        dataIndex: 'priority',
        key: 'priority',
        render: (priority: Priority) => (
          <Tag color={PRIORITY_MAP[priority].color}>{PRIORITY_MAP[priority].label}</Tag>
        ),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: string[]) => (
          <>
            {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          </>
        ),
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        sorter: (a: Task, b: Task) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf(),
        render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      },
      {
        title: 'Hành động',
        key: 'action',
        render: (_: any, record: Task) => (
          <Space size="middle">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
            <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Tìm kiếm theo tên task..." 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table columns={columns} dataSource={filteredTasks} rowKey="id" />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Theo Dõi Công Việc Cá Nhân</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm Task mới
        </Button>
      </div>

      <Tabs
        defaultActiveKey="dashboard"
        items={[
          { key: 'dashboard', label: 'Dashboard', children: <DashboardTab /> },
          { key: 'kanban', label: 'Kanban Board', children: <KanbanTab /> },
          { key: 'list', label: 'Danh sách Task', children: <ListTab /> },
        ]}
      />

      <Modal
        title={editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên task!' }]}>
            <Input placeholder="Nhập tên công việc" />
          </Form.Item>
          
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deadline" label="Deadline" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                <Select placeholder="Chọn mức độ">
                  <Select.Option value="high">Cao</Select.Option>
                  <Select.Option value="medium">Trung bình</Select.Option>
                  <Select.Option value="low">Thấp</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="Tag (Phân loại)">
            <Select mode="tags" placeholder="Gõ để thêm tag mới" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}