import React, {useMemo} from 'react';
import {Avatar, Dropdown, Layout, Menu as AntdMenu, type MenuProps, theme} from 'antd';
import {DashboardOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '@/store/AuthContext';
import type {Menu} from '@/api/menu';

const {Header, Sider, Content} = Layout;

// 提取 Antd Menu 的 items 类型定义
type MenuItem = Required<MenuProps>['items'][number];

/**
 * 将 AuthContext 中已构建好的菜单树数据转换为 Ant Design Menu 所需的数据结构
 */
export function buildMenuItems(menus: Menu[]): MenuItem[] {
    if (!menus || menus.length === 0) return [];

    return menus.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        return {
            key: item.path,
            label: item.title,
            children: hasChildren ? buildMenuItems(item.children!) : undefined,
        };
    });
}

export const BasicLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, menus, logout} = useAuth();
    const {token: {colorBgContainer, borderRadiusLG}} = theme.useToken();

    // 动态生成菜单项
    const menuItems = useMemo(() => {
        if (menus && menus.length > 0) {
            return buildMenuItems(menus);
        }
        // 如果后端还没返回数据，显示默认仪表盘占位
        return [{key: '/dashboard', icon: <DashboardOutlined/>, label: '仪表盘'}];
    }, [menus]);

    const handleLogout = () => {
        logout();
        navigate('/login', {replace: true});
    };

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider trigger={null} collapsible>
                <div style={{
                    height: 32,
                    margin: 16,
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: '32px',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    My Admin
                </div>
                <AntdMenu
                    theme="dark"
                    mode="inline"
                    // 使用当前路径作为选中的 key
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({key}) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: colorBgContainer,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)'
                }}>
                    <div/>
                    {/* 占位，后期可放 Breadcrumb */}
                    <Dropdown menu={{
                        items: [
                            {key: 'logout', icon: <LogoutOutlined/>, label: '退出登录', onClick: handleLogout},
                        ],
                    }}>
                        <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                            <Avatar size="small" icon={<UserOutlined/>}/>
                            <span style={{marginLeft: 8}}>{user?.nickname || user?.username || '管理员'}</span>
                        </span>
                    </Dropdown>
                </Header>
                <Content style={{
                    margin: '24px 16px',
                    padding: 24,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    minHeight: 280,
                }}>
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
    );
};
