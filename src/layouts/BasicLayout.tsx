import React, {useState, useMemo} from 'react';
import {Layout, Menu, Button, Dropdown, Avatar, theme} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import {Outlet, useNavigate} from 'react-router-dom';
import {useAuth} from '@/store/AuthContext';
import type {MenuItem} from '@/api/user';

const {Header, Sider, Content} = Layout;

const iconMap: Record<string, React.ReactNode> = {
    DashboardOutlined: <DashboardOutlined />,
    UserOutlined: <UserOutlined />,
};

function buildMenuItems(menus: MenuItem[]): { key: string; icon?: React.ReactNode; label: string; children?: unknown[] }[] {
    return menus.map(item => ({
        key: item.key,
        icon: item.icon ? iconMap[item.icon] : undefined,
        label: item.label,
        ...(item.children ? {children: buildMenuItems(item.children)} : {}),
    }));
}

export const BasicLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const {user, menus, logout} = useAuth();
    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();

    const menuItems = useMemo(() => {
        if (menus.length > 0) {
            return buildMenuItems(menus);
        }
        return [{key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘'}];
    }, [menus]);

    const handleLogout = () => {
        logout();
        navigate('/login', {replace: true});
    };

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: '#fff', textAlign: 'center', lineHeight: '32px'}}>
                    My Admin
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['/dashboard']}
                    items={menuItems}
                    onClick={({key}) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{fontSize: '16px', width: 64, height: 64}}
                    />
                    <Dropdown menu={{
                        items: [
                            {key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout},
                        ],
                    }}>
                        <span style={{cursor: 'pointer'}}>
                            <Avatar size="small" icon={<UserOutlined />} />
                            <span style={{marginLeft: 8}}>{user?.nickname || user?.username || '用户'}</span>
                        </span>
                    </Dropdown>
                </Header>
                <Content style={{margin: '24px 16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG}}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
