import React, {useMemo} from 'react';
import {Breadcrumb, Dropdown} from 'antd';
import {LogoutOutlined} from '@ant-design/icons';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '@/store/auth/AuthContext.ts';
import {type Menu} from '@/api/menu';

function findBreadcrumbPath(menus: Menu[], pathname: string, parentPath = ''): Menu[] {
    for (const menu of menus) {
        const fullPath = parentPath + '/' + menu.path;
        if (fullPath === pathname) {
            return [menu];
        }
        if (menu.hasChildren) {
            const childPath = findBreadcrumbPath(menu.children!, pathname, fullPath);
            if (childPath.length > 0) {
                return [menu, ...childPath];
            }
        }
    }
    return [];
}

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, logout, menus} = useAuth();
    const breadcrumbItems = useMemo(() => {
        const path = findBreadcrumbPath(menus, location.pathname);
        if (path.length > 0) {
            return path.map(menu => ({title: menu.title}));
        }
        if (location.pathname.startsWith('/dashboard')) {
            return [{title: '仪表盘'}];
        }
        return [];
    }, [menus, location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login', {replace: true});
    };

    return (
        <div className="layout-right-section layout-header">
            <Breadcrumb items={breadcrumbItems}/>
            <Dropdown menu={{
                items: [
                    {key: 'logout', icon: <LogoutOutlined/>, label: '退出登录', onClick: handleLogout},
                ],
            }}>
                <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                    <span>{user?.nickname || '默认昵称'}</span>
                </span>
            </Dropdown>
        </div>
    );
};
