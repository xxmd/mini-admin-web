import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>仪表盘 (Dashboard)</Title>
        <Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
          欢迎使用系统！此处可后续添加统计数据卡片、数据图表或最近活动列表。
        </Paragraph>
      </Card>
    </div>
  );
};

export default Dashboard;
