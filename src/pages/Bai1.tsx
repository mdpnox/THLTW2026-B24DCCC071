import React, { useState, useMemo } from 'react';
import {
  Layout, Menu, Card, Row, Col, Statistic, Timeline, Table, Tag, Button,
  Input, Select, DatePicker, Popconfirm, Modal, Form, Drawer, Progress, Segmented, InputNumber, Space, Typography, message
} from 'antd';
import {
  DashboardOutlined, BookOutlined, HeartOutlined, TagOutlined,
  PlaySquareOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Workout { id: string; date: string; type: string; duration: number; calories: number; notes: string; status: string; }
interface HealthMetric { id: string; date: string; weight: number; height: number; heartRate: number; sleep: number; }
interface Goal { id: string; name: string; type: string; target: number; current: number; deadline: string; status: string; }
interface Exercise { id: string; name: string; muscle: string; difficulty: string; desc: string; calPerHour: number; }

const initialWorkouts: Workout[] = [
  { id: '1', date: '2023-10-01', type: 'Cardio', duration: 30, calories: 300, notes: 'Chạy bộ nhẹ nhàng', status: 'Hoàn thành' },
  { id: '2', date: '2023-10-03', type: 'Strength', duration: 45, calories: 400, notes: 'Đẩy ngực, kéo xô', status: 'Hoàn thành' },
  { id: '3', date: '2023-10-10', type: 'Yoga', duration: 60, calories: 200, notes: 'Yoga thư giãn', status: 'Hoàn thành' },
];

const initialMetrics: HealthMetric[] = [
  { id: '1', date: '2023-10-01', weight: 70, height: 175, heartRate: 65, sleep: 7.5 },
  { id: '2', date: '2023-10-08', weight: 69.5, height: 175, heartRate: 64, sleep: 8 },
];

const initialGoals: Goal[] = [
  { id: '1', name: 'Giảm 5kg', type: 'Giảm cân', target: 5, current: 2, deadline: '2023-12-31', status: 'Đang thực hiện' },
  { id: '2', name: 'Chạy 10km', type: 'Cải thiện sức bền', target: 10, current: 10, deadline: '2023-11-15', status: 'Đã đạt' },
];

const initialExercises: Exercise[] = [
  { id: '1', name: 'Push Up', muscle: 'Chest', difficulty: 'Trung bình', desc: 'Hít đất cơ bản', calPerHour: 400 },
  { id: '2', name: 'Squat', muscle: 'Legs', difficulty: 'Dễ', desc: 'Gập gối squat', calPerHour: 450 },
  { id: '3', name: 'Pull Up', muscle: 'Back', difficulty: 'Khó', desc: 'Hít xà đơn', calPerHour: 500 },
];

const getBmiTag = (weight: number, height: number) => {
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return { color: 'blue', label: 'Thiếu cân', value: bmi.toFixed(1) };
  if (bmi < 25) return { color: 'green', label: 'Bình thường', value: bmi.toFixed(1) };
  if (bmi < 30) return { color: 'gold', label: 'Thừa cân', value: bmi.toFixed(1) };
  return { color: 'red', label: 'Béo phì', value: bmi.toFixed(1) };
};

export default function FitnessApp() {
  const [activeMenu, setActiveMenu] = useState('1');

  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [metrics, setMetrics] = useState<HealthMetric[]>(initialMetrics);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  const DashboardView = () => {
    const totalWorkoutsThisMonth = workouts.filter(w => dayjs(w.date).month() === dayjs().month()).length;
    const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);

    const workoutDates = workouts.map(w => dayjs(w.date).format('YYYY-MM-DD')).sort();
    let streak = 0;
    for (let i = workoutDates.length - 1; i >= 0; i--) {
      const expectedDate = dayjs().subtract(streak, 'day').format('YYYY-MM-DD');
      if (workoutDates[i] === expectedDate) streak++;
      else break;
    }
    const completedGoals = goals.filter(g => g.status === 'Đã đạt').length;
    const goalPercent = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;


    const weeks = Array.from({ length: 4 }, (_, i) => {
      const start = dayjs().subtract(3 - i, 'week').startOf('week');
      const end = start.endOf('week');
      const count = workouts.filter(w => dayjs(w.date).isBetween(start, end, null, '[]')).length;
      return { name: `Tuần ${i+1}`, workouts: count };
    });

    const lineData = [...metrics].sort((a,b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()).map(m => ({ date: m.date, weight: m.weight }));

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={6}><Card><Statistic title="Tổng buổi tập (Tháng)" value={totalWorkoutsThisMonth} /></Card></Col>
          <Col span={6}><Card><Statistic title="Tổng calo đã đốt" value={totalCalories} suffix="kcal" /></Card></Col>
          <Col span={6}><Card><Statistic title="Số ngày tập liên tiếp (Streak)" value={streak} /></Card></Col>
          <Col span={6}><Card><Statistic title="Mục tiêu hoàn thành" value={goalPercent} suffix="%" /></Card></Col>
        </Row>
        <Row gutter={16}>
          <Col span={10}>
            <Card title="Số buổi tập theo tuần">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeks}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Bar dataKey="workouts" fill="#1890ff" /></BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={10}>
            <Card title="Thay đổi cân nặng">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={['auto', 'auto']} /><RechartsTooltip /><Line type="monotone" dataKey="weight" stroke="#52c41a" /></LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={4}>
            <Card title="5 buổi gần nhất">
              <Timeline>
                {workouts.slice(-5).reverse().map(w => (
                  <Timeline.Item key={w.id}>{`${w.date}: ${w.type} (${w.duration}m)`}</Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  const WorkoutLogView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const filteredWorkouts = useMemo(() => {
      let data = [...workouts];
      if (searchText) {
        data = data.filter(w => w.type.toLowerCase().includes(searchText.toLowerCase()) || w.notes?.toLowerCase().includes(searchText.toLowerCase()));
      }
      if (filterType) {
        data = data.filter(w => w.type === filterType);
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        data = data.filter(w => dayjs(w.date).isBetween(dateRange[0], dateRange[1], null, '[]'));
      }
      return data;
    }, [workouts, searchText, filterType, dateRange]);

    const columns = [
      { title: 'Ngày', dataIndex: 'date' },
      { title: 'Loại bài tập', dataIndex: 'type' },
      { title: 'Thời lượng (p)', dataIndex: 'duration' },
      { title: 'Calo đốt', dataIndex: 'calories' },
      { title: 'Ghi chú', dataIndex: 'notes' },
      { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <Tag color={s === 'Hoàn thành' ? 'green' : 'red'}>{s}</Tag> },
      {
        title: 'Hành động', render: (_: any, record: Workout) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => { setEditingId(record.id); form.setFieldsValue({ ...record, date: dayjs(record.date) }); setIsModalOpen(true); }} />
            <Popconfirm title="Xóa buổi tập?" onConfirm={() => setWorkouts(workouts.filter(w => w.id !== record.id))}><Button danger icon={<DeleteOutlined />} /></Popconfirm>
          </Space>
        )
      }
    ];

    const handleSave = (values: any) => {
      const newWorkout = { ...values, id: editingId || Date.now().toString(), date: values.date.format('YYYY-MM-DD'), calories: values.calories || 0 };
      if (editingId) setWorkouts(workouts.map(w => w.id === editingId ? newWorkout : w));
      else setWorkouts([...workouts, newWorkout]);
      setIsModalOpen(false); form.resetFields(); setEditingId(null);
      message.success(editingId ? 'Cập nhật thành công' : 'Thêm buổi tập thành công');
    };

    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="Tìm theo loại hoặc ghi chú" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Select placeholder="Loại bài tập" allowClear style={{ width: 150 }} options={['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'].map(v => ({ value: v, label: v }))} value={filterType} onChange={setFilterType} />
          <RangePicker onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setIsModalOpen(true); }}>Thêm buổi tập</Button>
        </Space>
        <Table dataSource={filteredWorkouts} columns={columns} rowKey="id" />
        <Modal title={editingId ? "Sửa buổi tập" : "Thêm buổi tập"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
          <Form form={form} onFinish={handleSave} layout="vertical">
            <Form.Item name="date" label="Ngày tập" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="type" label="Loại bài tập" rules={[{ required: true }]}><Select options={['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'].map(v => ({ value: v, label: v }))} /></Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
              <Col span={12}><Form.Item name="calories" label="Calo đốt"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            </Row>
            <Form.Item name="status" label="Trạng thái"><Select options={[{ value: 'Hoàn thành', label: 'Hoàn thành' }, { value: 'Bỏ lỡ', label: 'Bỏ lỡ' }]} /></Form.Item>
            <Form.Item name="notes" label="Ghi chú"><Input.TextArea /></Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  const HealthMetricsView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);

    const columns = [
      { title: 'Ngày', dataIndex: 'date' },
      { title: 'Cân nặng (kg)', dataIndex: 'weight' },
      { title: 'Chiều cao (cm)', dataIndex: 'height' },
      {
        title: 'BMI', render: (_: any, record: HealthMetric) => {
          const { color, value, label } = getBmiTag(record.weight, record.height);
          return <Tag color={color}>{value} ({label})</Tag>;
        }
      },
      { title: 'Nhịp tim (bpm)', dataIndex: 'heartRate' },
      { title: 'Giờ ngủ', dataIndex: 'sleep' },
      {
        title: 'Hành động', render: (_: any, record: HealthMetric) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => { setEditingId(record.id); form.setFieldsValue({ ...record, date: dayjs(record.date) }); setIsModalOpen(true); }} />
            <Popconfirm title="Xóa chỉ số?" onConfirm={() => setMetrics(metrics.filter(m => m.id !== record.id))}><Button danger icon={<DeleteOutlined />} /></Popconfirm>
          </Space>
        )
      }
    ];

    const handleSave = (values: any) => {
      const newMetric = { ...values, id: editingId || Date.now().toString(), date: values.date.format('YYYY-MM-DD') };
      if (editingId) setMetrics(metrics.map(m => m.id === editingId ? newMetric : m));
      else setMetrics([...metrics, newMetric]);
      setIsModalOpen(false); form.resetFields(); setEditingId(null);
      message.success(editingId ? 'Cập nhật thành công' : 'Thêm chỉ số thành công');
    };

    return (
      <div>
        <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { form.resetFields(); setEditingId(null); setIsModalOpen(true); }}>Thêm chỉ số</Button>
        <Table dataSource={metrics} columns={columns} rowKey="id" />
        <Modal title={editingId ? "Sửa chỉ số" : "Thêm chỉ số"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
          <Form form={form} onFinish={handleSave} layout="vertical">
            <Form.Item name="date" label="Ngày" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} step={0.1} /></Form.Item></Col>
              <Col span={12}><Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={50} max={300} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="heartRate" label="Nhịp tim (bpm)"><InputNumber style={{ width: '100%' }} min={30} max={200} /></Form.Item></Col>
              <Col span={12}><Form.Item name="sleep" label="Giờ ngủ"><InputNumber style={{ width: '100%' }} min={0} max={24} step={0.5} /></Form.Item></Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  const GoalManagementView = () => {
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [goalForm] = Form.useForm();

    const filteredGoals = statusFilter === 'Tất cả' ? goals : goals.filter(g => g.status === statusFilter);

    const updateCurrent = (id: string, val: number | null) => {
      if (val !== null) setGoals(goals.map(g => g.id === id ? { ...g, current: val } : g));
    };

    const handleAddGoal = (values: any) => {
      const newGoal: Goal = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        target: values.target,
        current: 0,
        deadline: values.deadline.format('YYYY-MM-DD'),
        status: 'Đang thực hiện',
      };
      setGoals([...goals, newGoal]);
      setIsDrawerOpen(false);
      goalForm.resetFields();
      message.success('Thêm mục tiêu thành công');
    };

    return (
      <div>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Segmented options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']} value={statusFilter} onChange={setStatusFilter as any} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>Thêm mục tiêu</Button>
        </Space>

        <Row gutter={[16, 16]}>
          {filteredGoals.map(goal => (
            <Col span={8} key={goal.id}>
              <Card
                title={goal.name}
                extra={<Tag color={goal.status === 'Đã đạt' ? 'green' : 'blue'}>{goal.status}</Tag>}
                actions={[
                  <Popconfirm title="Xóa mục tiêu?" onConfirm={() => setGoals(goals.filter(g => g.id !== goal.id))}><DeleteOutlined key="delete" style={{ color: 'red' }} /></Popconfirm>
                ]}
              >
                <p><strong>Loại:</strong> {goal.type}</p>
                <p><strong>Deadline:</strong> {goal.deadline}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <strong>Hiện tại:</strong>
                  <InputNumber value={goal.current} onChange={(val) => updateCurrent(goal.id, val)} size="small" />
                  / {goal.target}
                </div>
                <Progress percent={Math.round((goal.current / goal.target) * 100)} status={goal.current >= goal.target ? 'success' : 'active'} />
              </Card>
            </Col>
          ))}
        </Row>

        <Drawer title="Thêm mục tiêu mới" placement="right" onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen} width={400}>
          <Form form={goalForm} layout="vertical" onFinish={handleAddGoal}>
            <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}><Select options={['Giảm cân', 'Tăng cơ', 'Cải thiện sức bền', 'Khác'].map(v => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="target" label="Giá trị mục tiêu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
            <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit" block>Lưu mục tiêu</Button></Form.Item>
          </Form>
        </Drawer>
      </div>
    );
  };

  const ExerciseLibraryView = () => {
    const [searchTxt, setSearchTxt] = useState('');
    const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);     
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [exerciseForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const filteredExercises = useMemo(() => {
      let data = [...exercises];
      if (searchTxt) data = data.filter(e => e.name.toLowerCase().includes(searchTxt.toLowerCase()));
      if (muscleFilter) data = data.filter(e => e.muscle === muscleFilter);
      if (difficultyFilter) data = data.filter(e => e.difficulty === difficultyFilter); // Logic lọc độ khó mới thêm
      return data;
    }, [exercises, searchTxt, muscleFilter, difficultyFilter]);

    const handleAddExercise = (values: any) => {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        ...values,
      };
      setExercises([...exercises, newExercise]);
      setIsModalOpen(false);
      exerciseForm.resetFields();
      message.success('Thêm bài tập thành công');
    };

    const handleEditExercise = (exercise: Exercise) => {
      setEditingExercise(exercise);
      editForm.setFieldsValue(exercise);
      setIsEditModalOpen(true);
    };

    const handleUpdateExercise = (values: any) => {
      if (!editingExercise) return;
      const updatedExercise = { ...editingExercise, ...values };
      setExercises(exercises.map(ex => ex.id === editingExercise.id ? updatedExercise : ex));
      setIsEditModalOpen(false);
      setEditingExercise(null);
      editForm.resetFields();
      message.success('Cập nhật bài tập thành công');
    };

    const handleDeleteExercise = (id: string) => {
      setExercises(exercises.filter(ex => ex.id !== id));
      message.success('Xóa bài tập thành công');
    };

    return (
      <div>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="Tìm tên bài tập..." prefix={<SearchOutlined />} onChange={e => setSearchTxt(e.target.value)} style={{ width: 200 }} />
          <Select placeholder="Nhóm cơ" allowClear style={{ width: 150 }} options={['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(v => ({ value: v, label: v }))} onChange={setMuscleFilter} />

          <Select placeholder="Độ khó" allowClear style={{ width: 120 }} options={['Dễ', 'Trung bình', 'Khó'].map(v => ({ value: v, label: v }))} onChange={setDifficultyFilter} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Thêm bài tập</Button>
        </Space>

        <Row gutter={[16, 16]}>
          {filteredExercises.map(ex => (
            <Col span={8} key={ex.id}>
              <Card
                hoverable
                onClick={() => setSelectedExercise(ex)}
                title={ex.name}
                extra={
                  <Space>
                    <Tag color={ex.difficulty === 'Dễ' ? 'green' : ex.difficulty === 'Khó' ? 'red' : 'orange'}>{ex.difficulty}</Tag>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={(e) => { e.stopPropagation(); handleEditExercise(ex); }} 
                    />
                    <Popconfirm 
                      title="Xóa bài tập này?" 
                      onConfirm={(e) => { e?.stopPropagation(); handleDeleteExercise(ex.id); }}
                      onCancel={(e) => e?.stopPropagation()}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                    </Popconfirm>
                  </Space>
                }
              >
                <p><strong>Nhóm cơ:</strong> {ex.muscle}</p>
                <p><strong>Mô tả:</strong> {ex.desc}</p>
                <p><strong>Calo TB/giờ:</strong> {ex.calPerHour} kcal</p>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal title={selectedExercise?.name} open={!!selectedExercise} onCancel={() => setSelectedExercise(null)} footer={null}>
          {selectedExercise && (
            <div>
              <p><strong>Nhóm cơ tác động:</strong> <Tag>{selectedExercise.muscle}</Tag></p>
              <p><strong>Độ khó:</strong> {selectedExercise.difficulty}</p>
              <p><strong>Calo đốt trung bình:</strong> {selectedExercise.calPerHour} kcal/giờ</p>
              <p><strong>Hướng dẫn chi tiết:</strong> Đây là hướng dẫn thực hiện bài tập {selectedExercise.name}. Bạn nên khởi động kỹ trước khi tập và thực hiện đúng tư thế để tránh chấn thương.</p>
            </div>
          )}
        </Modal>

        <Modal title="Thêm bài tập mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => exerciseForm.submit()}>
          <Form form={exerciseForm} layout="vertical" onFinish={handleAddExercise}>
            <Form.Item name="name" label="Tên bài tập" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="muscle" label="Nhóm cơ tác động" rules={[{ required: true }]}><Select options={['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(v => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true }]}><Select options={['Dễ', 'Trung bình', 'Khó'].map(v => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="desc" label="Mô tả ngắn"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="calPerHour" label="Calo đốt trung bình/giờ" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </Form>
        </Modal>

        <Modal title="Sửa bài tập" open={isEditModalOpen} onCancel={() => { setIsEditModalOpen(false); setEditingExercise(null); editForm.resetFields(); }} onOk={() => editForm.submit()}>
          <Form form={editForm} layout="vertical" onFinish={handleUpdateExercise}>
            <Form.Item name="name" label="Tên bài tập" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="muscle" label="Nhóm cơ tác động" rules={[{ required: true }]}><Select options={['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(v => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true }]}><Select options={['Dễ', 'Trung bình', 'Khó'].map(v => ({ value: v, label: v }))} /></Form.Item>
            <Form.Item name="desc" label="Mô tả ngắn"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="calPerHour" label="Calo đốt trung bình/giờ" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={250}>
        <div style={{ padding: 16, textAlign: 'center' }}><Title level={3} style={{ color: '#1890ff', margin: 0 }}>FitTrack Pro</Title></div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={(e) => setActiveMenu(e.key)}
          items={[
            { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '2', icon: <BookOutlined />, label: 'Nhật ký tập luyện' },
            { key: '3', icon: <HeartOutlined />, label: 'Nhật ký chỉ số' },
            { key: '4', icon: <TagOutlined />, label: 'Quản lý mục tiêu' },
            { key: '5', icon: <PlaySquareOutlined />, label: 'Thư viện bài tập' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={4} style={{ lineHeight: '64px', margin: 0 }}>
            {['Dashboard', 'Nhật ký tập luyện', 'Nhật ký chỉ số sức khỏe', 'Quản lý mục tiêu', 'Thư viện bài tập'][parseInt(activeMenu) - 1]}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8, overflow: 'initial' }}>
          {activeMenu === '1' && <DashboardView />}
          {activeMenu === '2' && <WorkoutLogView />}
          {activeMenu === '3' && <HealthMetricsView />}
          {activeMenu === '4' && <GoalManagementView />}
          {activeMenu === '5' && <ExerciseLibraryView />}
        </Content>
      </Layout>
    </Layout>
  );
}