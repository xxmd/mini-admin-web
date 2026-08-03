import React, { useMemo, useState, useEffect } from 'react';
import { Layout, Menu as AntdMenu, type MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Menu } from '@/api/menu';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

// 辅助工具：规范化路径拼接
function joinPaths(parentPath: string, path: string) {
    if (!path) return parentPath;
    if (path.startsWith('/')) return path;
    return parentPath ? `${parentPath.replace(/\/$/, '')}/${path}` : `/${path}`;
}

// 转换菜单项数据
function buildMenuItems(menus: Menu[], parentPath = ''): MenuItem[] {
    if (!menus || menus.length === 0) return [];

    return menus.map(item => {
        const fullPath = joinPaths(parentPath, item.path);
        const hasChildren = item.children && item.children.length > 0;

        return {
            key: fullPath,
            label: item.title,
            children: hasChildren ? buildMenuItems(item.children!, fullPath) : undefined,
        };
    });
}

// 获取匹配当前路径需要展开的所有父级 key
function getOpenKeys(pathname: string): string[] {
    const paths = pathname.split('/').filter(Boolean);
    const openKeys: string[] = [];
    let current = '';
    for (let i = 0; i < paths.length - 1; i++) {
        current += `/${paths[i]}`;
        openKeys.push(current);
    }
    return openKeys;
}

interface SiderMenuProps {
    menus: Menu[];
    collapsed?: boolean;
}

export const SiderMenu: React.FC<SiderMenuProps> = ({ menus, collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 格式化后的 Antd Menu 数据结构
    const menuItems = useMemo(() => buildMenuItems(menus), [menus]);

    // 当前选中的 key
    const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

    // 控制当前展开的 sub-menu 路径
    const [openKeys, setOpenKeys] = useState<string[]>(() => getOpenKeys(location.pathname));

    useEffect(() => {
        if (!collapsed) {
            setOpenKeys(getOpenKeys(location.pathname));
        }
    }, [location.pathname, collapsed]);

    return (
        <Sider trigger={null} collapsible collapsed={collapsed}>
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
                MiniAdmin
            </div>
            <AntdMenu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={(keys) => setOpenKeys(keys as string[])}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
};
