import React, {Suspense} from 'react';
import {Layout, type MenuProps, Spin, theme} from 'antd';
import {Outlet} from 'react-router-dom';
import {useAuth} from '@/store/AuthContext';
import type {Menu} from '@/api/menu';
import {SiderMenu} from "@/layouts/components/SiderMenu.tsx";
import {HeaderContent} from "@/layouts/components/HeaderContent.tsx";

const {Content} = Layout;

// 提取 Antd Index 的 items 类型定义
type MenuItem = Required<MenuProps>['items'][number];

/**
 * 将 AuthContext 中已构建好的菜单树数据转换为 Ant Design Menu 所需的数据结构
 */
export function buildMenuItems(menus: Menu[], parentPath = ''): MenuItem[] {
    if (!menus || menus.length === 0) return [];

    return menus.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        // 拼接完整路径：父路径 + 当前路径
        const fullPath = parentPath ? `${parentPath}/${item.path}` : `/${item.path}`;
        return {
            key: fullPath,
            label: item.title,
            children: hasChildren ? buildMenuItems(item.children!, fullPath) : undefined,
        };
    });
}

export const BasicLayout: React.FC = () => {
    const { menus } = useAuth();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SiderMenu menus={menus} />
            <Layout>
                <HeaderContent />
                <Content>
                    <Suspense fallback={
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Spin size="large" />
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </Content>
            </Layout>
        </Layout>
    );
}
