import React from 'react';
import {RouterProvider} from 'react-router-dom';
import {App, ConfigProvider, Spin} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {createAppRouter} from './router';
import {AuthProvider} from './store/auth/AuthProvider.tsx';
import {useAuth} from "@/store/auth/AuthContext.ts";
import './App.css'

const RouterView: React.FC = () => {
    const {initialized, menus, redirectUrl, clearRedirect} = useAuth();

    if (!initialized) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" description="正在初始化..."/>
            </div>
        );
    }

    const router = createAppRouter(menus);

    if (redirectUrl) {
        clearRedirect();
        void router.navigate(redirectUrl, {replace: true});
    }

    return <RouterProvider router={router}/>;
};

const AppRoot: React.FC = () => {
    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {},
            }}
        >
            <App>
                <AuthProvider>
                    <RouterView/>
                </AuthProvider>
            </App>
        </ConfigProvider>
    );
};

export default AppRoot;
