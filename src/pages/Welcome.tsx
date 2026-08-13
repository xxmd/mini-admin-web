import React from 'react';
import {Card, Col, Row, Statistic, Typography} from 'antd';
import {TeamOutlined, SafetyOutlined, MenuOutlined, UserOutlined} from '@ant-design/icons';
import {useAuth} from '@/store/auth/AuthContext';

const {Title, Text} = Typography;

const Welcome: React.FC = () => {
    const {user} = useAuth();

    const roleCount = user?.roleSet?.size ?? 0;

    return (
        <div style={{padding: 24}}>
            <Card style={{marginBottom: 24}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                            color: '#fff',
                            flexShrink: 0,
                        }}
                    >
                        <UserOutlined/>
                    </div>
                    <div>
                        <Title level={4} style={{marginBottom: 4}}>
                            欢迎回来，{user?.nickname ?? user?.username ?? '用户'}
                        </Title>
                        <Text type="secondary">祝您工作愉快！</Text>
                    </div>
                </div>
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="角色数量"
                            value={roleCount}
                            prefix={<TeamOutlined style={{color: '#1677ff'}}/>}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="系统模块"
                            value={3}
                            prefix={<MenuOutlined style={{color: '#52c41a'}}/>}
                            suffix="个"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="菜单管理"
                            value="可用"
                            prefix={<SafetyOutlined style={{color: '#faad14'}}/>}
                            valueStyle={{fontSize: 20}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="账号状态"
                            value={user?.enabled ? '正常' : '禁用'}
                            prefix={<UserOutlined style={{color: user?.enabled ? '#52c41a' : '#ff4d4f'}}/>}
                            valueStyle={{fontSize: 20, color: user?.enabled ? '#52c41a' : '#ff4d4f'}}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="快捷入口" style={{marginTop: 24}}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card.Grid style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>
                            <TeamOutlined style={{fontSize: 24, color: '#1677ff', marginBottom: 8}}/>
                            <div>用户管理</div>
                        </Card.Grid>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card.Grid style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>
                            <SafetyOutlined style={{fontSize: 24, color: '#52c41a', marginBottom: 8}}/>
                            <div>角色管理</div>
                        </Card.Grid>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card.Grid style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>
                            <MenuOutlined style={{fontSize: 24, color: '#faad14', marginBottom: 8}}/>
                            <div>菜单管理</div>
                        </Card.Grid>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Welcome;
