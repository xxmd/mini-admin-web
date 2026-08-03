import type {RouteObject} from 'react-router-dom';
import type {Menu} from '@/api/menu';
import {MenuType} from '@/api/menu';
import React from "react";

// 组件映射表：将后端返回的 component 路径映射到实际组件
// 使用 Vite 的 import.meta.glob 自动导入 pages 目录下的所有组件
const pageModules = import.meta.glob('@/pages/**/*.tsx');

const componentMap: Record<string, React.LazyExoticComponent<React.FC>> = {};

// 构建组件映射：key 为 component 字段值（如 "system/menu/index"）
Object.entries(pageModules).forEach(([path, loader]) => {
    // 提取相对路径，例如 /src/pages/system/menu/index.tsx -> system/menu/index
    const match = path.match(/\/pages\/(.+)\.tsx$/);
    if (match) {
        const key = match[1];
        componentMap[key] = React.lazy(loader as () => Promise<{default: React.FC}>);
    }
});

/**
 * 将菜单树转换为 React Router 路由配置
 */
export function generateRoutes(menus: Menu[]): RouteObject[] {
    return menus
        .filter(item => item.type !== MenuType.BUTTON)
        .map(item => {
            const route: RouteObject = {
                path: item.path,
            };

            // 如果有 component 字段，加载对应组件
            if (item.component && componentMap[item.component]) {
                route.element = React.createElement(componentMap[item.component]);
            }

            // 递归处理子菜单
            if (item.children && item.children.length > 0) {
                route.children = generateRoutes(item.children);
            }

            return route;
        });
}
