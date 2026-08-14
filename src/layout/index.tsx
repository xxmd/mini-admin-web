import React, {useEffect} from 'react';
import {Divider, type MenuProps, Spin} from 'antd';
import {useAuth} from '@/store/auth/AuthContext';
import {type Menu} from '@/api/system/menu';
import {Sidebar} from "./components/Sidebar";
import {Header} from "./components/Header";
import {Content} from "./components/Content";
import {preloadPages} from '@/router/dynamicRoutes';
import '@/layout/index.css'

type MenuItem = Required<MenuProps>['items'][number];

function collectComponents(menu: Menu): string[] {
    const result: string[] = [];
    if (menu.component) {
        result.push(menu.component);
    }
    if (menu.children) {
        for (const child of menu.children) {
            result.push(...collectComponents(child));
        }
    }
    return result;
}

function parseToMenuItem(menu: Menu): MenuItem {
    const components = collectComponents(menu);
    return {
        key: menu.path,
        label: components.length > 0
            ? <span onMouseEnter={() => preloadPages(components)}>{menu.title}</span>
            : menu.title,
        children: menu.children?.map(child => parseToMenuItem(child)),
    };
}

export const Layout: React.FC = () => {
    const {user, menus} = useAuth();

    useEffect(() => {
        const components: string[] = [];
        for (const menu of menus) {
            components.push(...collectComponents(menu));
        }
        preloadPages(components);
    }, [menus]);

    if (user == null) {
        return <Spin size="large" description="正在初始化..."/>;
    }
    const sidebarMenu = menus.map(menu => parseToMenuItem(menu));
    return (
        <div className={'layout-container'}>
            <Sidebar menus={sidebarMenu}/>
            <div className={'layout-right'}>
                <Header/>
                <Divider style={{margin: 0}}/>
                <Content/>
            </div>
        </div>
    );
}
