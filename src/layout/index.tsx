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

function parseToMenuItem(menu: Menu): MenuItem {
    return {
        key: menu.path,
        label: menu.title,
        children: menu.children?.map(child => parseToMenuItem(child))
    }
}

export const Layout: React.FC = () => {
    const {user, menus} = useAuth();

    useEffect(() => {
        const components: string[] = [];
        function collect(ms: Menu[]) {
            for (const m of ms) {
                if (m.component) {
                    components.push(m.component);
                }
                if (m.hasChildren && m.children) {
                    collect(Array.from(m.children));
                }
            }
        }
        collect(menus);
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
