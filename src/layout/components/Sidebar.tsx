import React, {useEffect, useMemo, useState} from 'react';
import {Layout, Menu, type MenuProps} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';

const {Sider} = Layout;
type MenuItem = Required<MenuProps>['items'][number];

interface SidebarProps {
    menus: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({menus}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const selectedKeys = useMemo(() => {
        const segments = location.pathname.split("/").filter(Boolean);
        const leaf = segments[segments.length - 1];
        return leaf ? [leaf] : [];
    }, [location.pathname]);

    const [openKeys, setOpenKeys] = useState<string[]>(() =>
        location.pathname.split("/").filter(Boolean).slice(0, -1),
    );

    useEffect(() => {
        const parentKeys = location.pathname.split("/").filter(Boolean).slice(0, -1);
        setOpenKeys(prev => Array.from(new Set([...prev, ...parentKeys])));
    }, [location.pathname]);

    return (
        <Sider>
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
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={(keys) => setOpenKeys(keys as string[])}
                items={menus}
                onClick={({keyPath}) => navigate("/" + keyPath.reverse().join("/"))}
            />
        </Sider>
    );
};
