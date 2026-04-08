import React, { useState, useMemo, useEffect } from 'react';
import {
  Layout, Menu, Card, Row, Col, Select, InputNumber, Button,
  List, Typography, Alert, Table, Modal, Form, Input, Space, Statistic, message,
  Slider, Upload, Image, Collapse, Popconfirm, Dropdown
} from 'antd';
import {
  HomeOutlined, CalendarOutlined, PieChartOutlined, SettingOutlined,
  DeleteOutlined, UpOutlined, DownOutlined, PlusOutlined, EditOutlined,
  UploadOutlined, SaveOutlined, PlusCircleOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Destination {
  id: string;
  name: string;
  location: string;
  type: 'biển' | 'núi' | 'thành phố';
  image: string;
  rating: number;
  description: string;
  visitTimeHours: number;
  foodCost: number;
  accommodationCost: number;
  transportCost: number;
}

interface SavedItinerary {
  id: string;
  date: string;
  itineraryDays: string[][];
  totalCost: number;
}


const initialDestinations: Destination[] = [
  { id: '1', name: 'Vịnh Hạ Long', location: 'Quảng Ninh', type: 'biển', image: 'https://cdn.xanhsm.com/2025/02/c0c9124a-vinh-ha-long-1.jpg', rating: 4.8, description: 'Di sản thiên nhiên thế giới', visitTimeHours: 24, foodCost: 1000000, accommodationCost: 1500000, transportCost: 1500000 },
  { id: '2', name: 'Sapa', location: 'Lào Cai', type: 'núi', image: 'https://vcdn1-dulich.vnecdn.net/2022/04/18/dulichSaPa-1650268886-1480-1650277620.png?w=0&h=0&q=100&dpr=2&fit=crop&s=JTUw8njZ_Glkqf1itzjObg', rating: 4.6, description: 'Thành phố trong sương', visitTimeHours: 48, foodCost: 800000, accommodationCost: 1200000, transportCost: 600000 },
  { id: '3', name: 'Phố cổ Hội An', location: 'Quảng Nam', type: 'thành phố', image: 'https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg', rating: 4.9, description: 'Di sản văn hóa thế giới', visitTimeHours: 12, foodCost: 500000, accommodationCost: 800000, transportCost: 300000 },
  { id: '4', name: 'Phú Quốc', location: 'Kiên Giang', type: 'biển', image: 'https://bcp.cdnchinhphu.vn/334894974524682240/2025/6/23/phu-quoc-17506756503251936667562.jpg', rating: 4.7, description: 'Đảo ngọc', visitTimeHours: 72, foodCost: 2000000, accommodationCost: 3000000, transportCost: 1500000 },
  { id: '5', name: 'Đà Lạt', location: 'Lâm Đồng', type: 'núi', image: 'https://vitracotour.com/wp-content/uploads/2024/02/du-lich-da-lat.jpg', rating: 4.3, description: 'Thành phố ngàn hoa', visitTimeHours: 48, foodCost: 2000000, accommodationCost: 1500000, transportCost: 1500000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const getTravelTime = (from: Destination, to: Destination): number => {
  if (!from || !to) return 0;
  const hash = (from.name.length + to.name.length) % 5 + 1;
  return hash;
};


const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function TravelApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  
  const [itineraryDays, setItineraryDays] = useState<string[][]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(10000000);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);


  useEffect(() => {
    const stored = localStorage.getItem('travel_itineraries');
    if (stored) {
      setSavedItineraries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('travel_itineraries', JSON.stringify(savedItineraries));
  }, [savedItineraries]);

 
  const saveCurrentItinerary = () => {
    if (itineraryDays.length === 0 || itineraryDays.every(day => day.length === 0)) {
      message.warning('Chưa có điểm đến nào trong lịch trình');
      return;
    }
  
    let totalCost = 0;
    itineraryDays.forEach(day => {
      day.forEach(id => {
        const d = destinations.find(dest => dest.id === id);
        if (d) totalCost += d.foodCost + d.accommodationCost + d.transportCost;
      });
    });
    const newItinerary: SavedItinerary = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      itineraryDays: itineraryDays.map(day => [...day]), 
      totalCost
    };
    setSavedItineraries(prev => [...prev, newItinerary]);
    message.success('Đã lưu lịch trình!');
  };


  const HomeView = () => {
    const [filterType, setFilterType] = useState<string>('all');
    const [sortRating, setSortRating] = useState<string>('none');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

    const filteredAndSorted = useMemo(() => {
      let result = [...destinations];
      if (filterType !== 'all') result = result.filter(d => d.type === filterType);
      result = result.filter(d => {
        const total = d.foodCost + d.accommodationCost + d.transportCost;
        return total >= priceRange[0] && total <= priceRange[1];
      });
      if (sortRating === 'asc') result.sort((a, b) => a.rating - b.rating);
      if (sortRating === 'desc') result.sort((a, b) => b.rating - a.rating);
      return result;
    }, [destinations, filterType, sortRating, priceRange]);

    const addToItinerary = (id: string) => {

      if (itineraryDays.length === 0) {
        setItineraryDays([[id]]);
      } else {
        const newDays = [...itineraryDays];
        newDays[0] = [...newDays[0], id];
        setItineraryDays(newDays);
      }
      message.success('Đã thêm vào lịch trình (ngày 1)');
    };

    const maxPrice = Math.max(...destinations.map(d => d.foodCost + d.accommodationCost + d.transportCost), 10000000);

    return (
      <div>
        <Title level={2}>Khám phá điểm đến</Title>
        <Space style={{ marginBottom: 20 }} wrap>
          <Select defaultValue="all" style={{ width: 150 }} onChange={setFilterType}>
            <Option value="all">Loại hình</Option>
            <Option value="biển">Biển</Option>
            <Option value="núi">Núi</Option>
            <Option value="thành phố">Thành phố</Option>
          </Select>
          <Select defaultValue="none" style={{ width: 150 }} onChange={setSortRating}>
            <Option value="none">Rating ngẫu nhiên</Option>
            <Option value="desc">Rating cao nhất</Option>
            <Option value="asc">Rating thấp nhất</Option>
          </Select>
          <div style={{ width: 300 }}>
            <Text>Khoảng giá (VNĐ): </Text>
            <Slider range min={0} max={maxPrice} step={500000} value={priceRange} onChange={(val) => setPriceRange(val as [number, number])} tipFormatter={(val) => formatCurrency(val || 0)} />
            <Text type="secondary">{formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</Text>
          </div>
        </Space>
        <Row gutter={[16, 16]}>
          {filteredAndSorted.map(dest => {
            const totalPrice = dest.foodCost + dest.accommodationCost + dest.transportCost;
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={dest.id}>
                <Card hoverable cover={<img alt={dest.name} src={dest.image} style={{ height: 150, objectFit: 'cover' }} />} actions={[<Button type="primary" onClick={() => addToItinerary(dest.id)}>Thêm vào lịch trình</Button>]}>
                  <Card.Meta title={dest.name} description={dest.location} />
                  <div style={{ marginTop: 10 }}>
                    <Text type="secondary">Loại: <strong style={{ textTransform: 'capitalize' }}>{dest.type}</strong></Text><br />
                    <Text type="secondary">Đánh giá: <strong>{dest.rating} ⭐</strong></Text><br />
                    <Text type="danger">Chi phí: <strong>{formatCurrency(totalPrice)}</strong></Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };


  const ItineraryView = () => {

    const getDestById = (id: string) => destinations.find(d => d.id === id)!;

    const addNewDay = () => {
      setItineraryDays([...itineraryDays, []]);
    };

    const removeDay = (dayIndex: number) => {
      const newDays = [...itineraryDays];
      newDays.splice(dayIndex, 1);
      setItineraryDays(newDays);
    };

    const moveDay = (dayIndex: number, direction: 'up' | 'down') => {
      const newDays = [...itineraryDays];
      const target = direction === 'up' ? dayIndex - 1 : dayIndex + 1;
      if (target < 0 || target >= newDays.length) return;
      [newDays[dayIndex], newDays[target]] = [newDays[target], newDays[dayIndex]];
      setItineraryDays(newDays);
    };

    const addDestinationToDay = (dayIndex: number, destId: string) => {
      const newDays = [...itineraryDays];
      newDays[dayIndex] = [...newDays[dayIndex], destId];
      setItineraryDays(newDays);
    };

    const removeDestinationFromDay = (dayIndex: number, destIndex: number) => {
      const newDays = [...itineraryDays];
      newDays[dayIndex] = newDays[dayIndex].filter((_, idx) => idx !== destIndex);
      setItineraryDays(newDays);
    };

    const moveDestinationInDay = (dayIndex: number, destIndex: number, direction: 'up' | 'down') => {
      const newDays = [...itineraryDays];
      const day = newDays[dayIndex];
      const target = direction === 'up' ? destIndex - 1 : destIndex + 1;
      if (target < 0 || target >= day.length) return;
      [day[destIndex], day[target]] = [day[target], day[destIndex]];
      newDays[dayIndex] = day;
      setItineraryDays(newDays);
    };

    const { totalVisitTime, totalTravelTime, totalHours, totalCost } = useMemo(() => {
      let visit = 0;
      let travel = 0;
      let cost = 0;
      const allDestIds: string[] = [];
      itineraryDays.forEach(day => {
        allDestIds.push(...day);
      });
      const allDests = allDestIds.map(id => getDestById(id)).filter(d => d);
      for (let i = 0; i < allDests.length; i++) {
        const d = allDests[i];
        visit += d.visitTimeHours;
        cost += d.foodCost + d.accommodationCost + d.transportCost;
        if (i < allDests.length - 1) {
          travel += getTravelTime(d, allDests[i + 1]);
        }
      }
      return { totalVisitTime: visit, totalTravelTime: travel, totalHours: visit + travel, totalCost: cost };
    }, [itineraryDays, destinations]);

    const DestinationDropdown = ({ dayIndex, onClose }: { dayIndex: number; onClose: () => void }) => {
      const availableDests = destinations.filter(dest => !itineraryDays[dayIndex]?.includes(dest.id));
      return (
        <div style={{ maxHeight: 200, overflowY: 'auto', minWidth: 200 }}>
          {availableDests.length === 0 ? <Text>Đã có hết điểm đến</Text> : availableDests.map(dest => (
            <div key={dest.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }} onClick={() => { addDestinationToDay(dayIndex, dest.id); onClose(); }}>
              <strong>{dest.name}</strong> - {dest.location}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div>
        <Title level={2}>Lịch trình của bạn (theo ngày)</Title>
        <Card style={{ marginBottom: 20 }}>
          <Space size="large" wrap>
            <Statistic title="Tổng thời gian tham quan" value={`${totalVisitTime} giờ`} />
            <Statistic title="Tổng thời gian di chuyển" value={`${totalTravelTime} giờ`} />
            <Statistic title="Tổng thời gian (cả di chuyển)" value={`${totalHours} giờ`} />
            <Statistic title="Tổng chi phí" value={formatCurrency(totalCost)} valueStyle={{ color: totalCost > budgetLimit ? '#cf1322' : '#3f8600' }} />
          </Space>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveCurrentItinerary}>Lưu lịch trình này</Button>
          </div>
        </Card>

        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" icon={<PlusCircleOutlined />} onClick={addNewDay}>Thêm ngày mới</Button>
        </div>

        <Collapse accordion defaultActiveKey={['0']}>
          {itineraryDays.map((day, dayIdx) => (
            <Panel
              header={`Ngày ${dayIdx + 1} (${day.length} điểm đến)`}
              key={dayIdx.toString()}
              extra={
                <Space>
                  <Button size="small" icon={<ArrowUpOutlined />} disabled={dayIdx === 0} onClick={(e) => { e.stopPropagation(); moveDay(dayIdx, 'up'); }} />
                  <Button size="small" icon={<ArrowDownOutlined />} disabled={dayIdx === itineraryDays.length - 1} onClick={(e) => { e.stopPropagation(); moveDay(dayIdx, 'down'); }} />
                  <Popconfirm title="Xóa ngày này?" onConfirm={(e) => { e?.stopPropagation(); removeDay(dayIdx); }} okText="Xóa" cancelText="Hủy">
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>
                </Space>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={day}
                renderItem={(destId, destIdx) => {
                  const dest = getDestById(destId);
                  if (!dest) return null;
                  return (
                    <List.Item
                      actions={[
                        <Button size="small" icon={<UpOutlined />} disabled={destIdx === 0} onClick={() => moveDestinationInDay(dayIdx, destIdx, 'up')} />,
                        <Button size="small" icon={<DownOutlined />} disabled={destIdx === day.length - 1} onClick={() => moveDestinationInDay(dayIdx, destIdx, 'down')} />,
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeDestinationFromDay(dayIdx, destIdx)} />
                      ]}
                    >
                      <List.Item.Meta
                        title={dest.name}
                        description={`${dest.location} - Thời gian tham quan: ${dest.visitTimeHours}h - Chi phí: ${formatCurrency(dest.foodCost + dest.accommodationCost + dest.transportCost)}`}
                      />
                    </List.Item>
                  );
                }}
                footer={
                  <div style={{ marginTop: 8 }}>
                    <Dropdown
                      overlay={<DestinationDropdown dayIndex={dayIdx} onClose={() => {}} />}
                      trigger={['click']}
                      placement="bottomLeft"
                    >
                      <Button icon={<PlusOutlined />} size="small">Thêm điểm đến vào ngày này</Button>
                    </Dropdown>
                  </div>
                }
              />
            </Panel>
          ))}
        </Collapse>
        {itineraryDays.length === 0 && <Alert message="Chưa có ngày nào." type="info" />}
      </div>
    );
  };


  const BudgetView = () => {

    const totalCost = useMemo(() => {
      let cost = 0;
      itineraryDays.forEach(day => {
        day.forEach(id => {
          const d = destinations.find(dest => dest.id === id);
          if (d) cost += d.foodCost + d.accommodationCost + d.transportCost;
        });
      });
      return cost;
    }, [itineraryDays, destinations]);

    const totalFood = useMemo(() => {
      let food = 0;
      itineraryDays.forEach(day => day.forEach(id => { const d = destinations.find(dest => dest.id === id); if (d) food += d.foodCost; }));
      return food;
    }, [itineraryDays, destinations]);

    const totalAcc = useMemo(() => {
      let acc = 0;
      itineraryDays.forEach(day => day.forEach(id => { const d = destinations.find(dest => dest.id === id); if (d) acc += d.accommodationCost; }));
      return acc;
    }, [itineraryDays, destinations]);

    const totalTrans = useMemo(() => {
      let trans = 0;
      itineraryDays.forEach(day => day.forEach(id => { const d = destinations.find(dest => dest.id === id); if (d) trans += d.transportCost; }));
      return trans;
    }, [itineraryDays, destinations]);

    const chartData = [
      { name: 'Ăn uống', value: totalFood },
      { name: 'Lưu trú', value: totalAcc },
      { name: 'Di chuyển', value: totalTrans },
    ];
    const isOverBudget = totalCost > budgetLimit;

    return (
      <div>
        <Title level={2}>Quản lý ngân sách</Title>
        <div style={{ marginBottom: 20 }}>
          <Text strong>Cài đặt ngân sách tối đa: </Text>
          <InputNumber style={{ width: 200 }} value={budgetLimit} onChange={(val) => setBudgetLimit(val || 0)} step={500000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /> VNĐ
        </div>
        {isOverBudget ? (
          <Alert message="Vượt ngân sách!" description={`Lịch trình của bạn đã vượt quá ngân sách ${formatCurrency(totalCost - budgetLimit)}.`} type="error" showIcon style={{ marginBottom: 20 }} />
        ) : (
          <Alert message="Ngân sách an toàn" description={`Bạn còn dư ${formatCurrency(budgetLimit - totalCost)}.`} type="success" showIcon style={{ marginBottom: 20 }} />
        )}
        <Row gutter={32}>
          <Col span={12}>
            <Card title="Phân bổ ngân sách">
              {totalCost === 0 ? <Text>Chưa có lịch trình nào.</Text> : (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Số liệu chi tiết">
              <List dataSource={chartData} renderItem={(item, index) => (
                <List.Item>
                  <Text><span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: COLORS[index], marginRight: 8 }}></span>{item.name}</Text>
                  <strong>{formatCurrency(item.value)}</strong>
                </List.Item>
              )} />
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Title level={4}>Tổng cộng: <span style={{ color: isOverBudget ? 'red' : 'green' }}>{formatCurrency(totalCost)}</span></Title>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };


  const AdminView = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string>('');

    const handleDelete = (id: string) => {
      setDestinations(destinations.filter(d => d.id !== id));

      const newDays = itineraryDays.map(day => day.filter(destId => destId !== id));
      setItineraryDays(newDays.filter(day => day.length > 0));
    };

    const openModal = (dest?: Destination) => {
      if (dest) {
        setEditingId(dest.id);
        form.setFieldsValue(dest);
        setImageBase64(dest.image);
      } else {
        setEditingId(null);
        form.resetFields();
        setImageBase64('');
      }
      setIsModalVisible(true);
    };

    const handleUpload = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => setImageBase64(e.target?.result as string);
      reader.readAsDataURL(file);
      return false;
    };

    const handleSave = (values: any) => {
      const newDestination = {
        ...values,
        id: editingId || Math.random().toString(),
        image: imageBase64 || 'https://picsum.photos/300/200',
        rating: values.rating || 0
      };
      if (editingId) {
        setDestinations(destinations.map(d => d.id === editingId ? newDestination : d));
      } else {
        setDestinations([...destinations, newDestination]);
      }
      setIsModalVisible(false);
      message.success('Đã lưu điểm đến!');
    };


    const stats = useMemo(() => {
      const monthlyCount: { [key: string]: number } = {};
      const monthlyRevenue: { [key: string]: number } = {};
      const destCount: { [id: string]: number } = {};
      let totalFood = 0, totalAcc = 0, totalTrans = 0;

      savedItineraries.forEach(itinerary => {
        const date = new Date(itinerary.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + itinerary.totalCost;


        const allDestIds = (itinerary.itineraryDays || []).flat();
        allDestIds.forEach(destId => {
          destCount[destId] = (destCount[destId] || 0) + 1;
          const dest = destinations.find(d => d.id === destId);
          if (dest) {
            totalFood += dest.foodCost;
            totalAcc += dest.accommodationCost;
            totalTrans += dest.transportCost;
          }
        });
      });

      let mostPopularId = '';
      let maxCount = 0;
      Object.entries(destCount).forEach(([id, count]) => {
        if (count > maxCount) { maxCount = count; mostPopularId = id; }
      });
      const mostPopularDest = destinations.find(d => d.id === mostPopularId);

      const chartMonthly = Object.keys(monthlyCount).map(month => ({
        month,
        count: monthlyCount[month],
        revenue: monthlyRevenue[month]
      })).sort((a, b) => a.month.localeCompare(b.month));

      const categoryData = [
        { name: 'Ăn uống', value: totalFood },
        { name: 'Lưu trú', value: totalAcc },
        { name: 'Di chuyển', value: totalTrans },
      ];

      return {
        totalItineraries: savedItineraries.length,
        monthlyData: chartMonthly,
        mostPopular: mostPopularDest?.name || 'Chưa có dữ liệu',
        categoryData,
        totalRevenue: savedItineraries.reduce((sum, i) => sum + i.totalCost, 0)
      };
    }, [savedItineraries, destinations]);

    const columns = [
      { title: 'Tên địa điểm', dataIndex: 'name', key: 'name' },
      { title: 'Vị trí', dataIndex: 'location', key: 'location' },
      { title: 'Loại', dataIndex: 'type', key: 'type', render: (text: string) => <span style={{ textTransform: 'capitalize' }}>{text}</span> },
      { title: 'Thời gian (h)', dataIndex: 'visitTimeHours', key: 'visitTimeHours' },
      { title: 'Hành động', key: 'action', render: (_: any, record: Destination) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Space>
        ),
      },
    ];

    return (
      <div>
        <Title level={2}>Trang Quản trị (Admin)</Title>
        <Card title="Thống kê tổng quan" style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col span={6}><Statistic title="Tổng điểm đến" value={destinations.length} /></Col>
            <Col span={6}><Statistic title="Tổng lịch trình đã lưu" value={stats.totalItineraries} /></Col>
            <Col span={6}><Statistic title="Địa điểm phổ biến nhất" value={stats.mostPopular} /></Col>
            <Col span={6}><Statistic title="Tổng doanh thu (VNĐ)" value={formatCurrency(stats.totalRevenue)} /></Col>
          </Row>
          <div style={{ height: 300, marginTop: 40 }}>
            <Title level={5}>Số lượt lịch trình theo tháng</Title>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Số lượt" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 300, marginTop: 40 }}>
            <Title level={5}>Doanh thu theo tháng (VNĐ)</Title>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => formatCurrency(val)} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Line type="monotone" dataKey="revenue" stroke="#ff7300" name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 300, marginTop: 40 }}>
            <Title level={5}>Số tiền theo từng hạng mục (từ các lịch trình đã lưu)</Title>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {stats.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Quản lý điểm đến" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm điểm đến</Button>}>
          <Table dataSource={destinations} columns={columns} rowKey="id" />
        </Card>
        <Modal title={editingId ? "Sửa điểm đến" : "Thêm điểm đến mới"} visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={600}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="name" label="Tên điểm đến" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="location" label="Vị trí (Tỉnh/Thành)" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="type" label="Loại hình" rules={[{ required: true }]}>
              <Select><Option value="biển">Biển</Option><Option value="núi">Núi</Option><Option value="thành phố">Thành phố</Option></Select>
            </Form.Item>
            <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="visitTimeHours" label="Thời gian tham quan (giờ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="foodCost" label="Phí ăn uống (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="accommodationCost" label="Phí lưu trú (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="transportCost" label="Phí di chuyển (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="rating" label="Đánh giá (1-5)"><InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="Hình ảnh">
              <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
              {imageBase64 && <Image src={imageBase64} width={100} style={{ marginTop: 10 }} />}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>

        <Menu theme="dark" mode="horizontal" selectedKeys={[currentTab]} onClick={(e) => setCurrentTab(e.key)} style={{ flex: 1 }}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: 'Khám phá' },
            { key: 'itinerary', icon: <CalendarOutlined />, label: 'Lịch trình' },
            { key: 'budget', icon: <PieChartOutlined />, label: 'Ngân sách' },
            { key: 'admin', icon: <SettingOutlined />, label: 'Admin' },
          ]}
        />
      </Header>
      <Content style={{ padding: '24px 50px', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 400, borderRadius: 8 }}>
          {currentTab === 'home' && <HomeView />}
          {currentTab === 'itinerary' && <ItineraryView />}
          {currentTab === 'budget' && <BudgetView />}
          {currentTab === 'admin' && <AdminView />}
        </div>
      </Content>
    </Layout>
  );
}