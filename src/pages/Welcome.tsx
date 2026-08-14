import React from 'react';
import {Card, Typography} from 'antd';
import {UserOutlined} from '@ant-design/icons';
import {useAuth} from '@/store/auth/AuthContext';

const {Title, Text} = Typography;

const Welcome: React.FC = () => {
    const {user} = useAuth();

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
        </div>
    );
};

export default Welcome;
