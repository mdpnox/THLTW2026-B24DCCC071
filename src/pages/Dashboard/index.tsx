import { useModel } from 'umi';
import { Card, Col, Row, Statistic } from 'antd';

const Dashboard = () => {
  const { products, orders } = useModel('useStore');

  const stats = {
    totalProducts: products?.length || 0,
    inventoryValue: products?.reduce((sum: number, p: any) => sum + p.price * p.quantity, 0) || 0,
    totalOrders: orders?.length || 0,
    revenue: orders?.filter((o: any) => o.status === 'Hoàn thành')
                   .reduce((sum: number, o: any) => sum + o.totalAmount, 0) || 0,
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="Tổng sản phẩm" value={stats.totalProducts} /></Card></Col>
        <Col span={6}><Card><Statistic title="Giá trị tồn kho" value={stats.inventoryValue} suffix="đ" /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng đơn hàng" value={stats.totalOrders} /></Card></Col>
        <Col span={6}><Card><Statistic title="Doanh thu" value={stats.revenue} suffix="đ" valueStyle={{ color: '#3f8600' }} /></Card></Col>
      </Row>
    </div>
  );
};

export default Dashboard;