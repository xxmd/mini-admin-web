import React from 'react';
import { Avatar, Dropdown, Layout, theme } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

const { Header } = Layout;

export const HeaderContent: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { token: { colorBgContainer } } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <Header style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
            <div />
            <Dropdown menu={{
                items: [
                    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
                ],
            }}>
                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: 8 }}>{user?.nickname || user?.username || '管理员'}</span>
                </span>
            </Dropdown>
        </Header>
    );
};
