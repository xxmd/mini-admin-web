import React, {useMemo} from 'react';
import {RouterProvider} from 'react-router-dom';
import {App, ConfigProvider, Spin} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {createAppRouter} from '@/router';
import {AuthProvider} from '@/store/auth/AuthProvider';
import {useAuth} from "@/store/auth/AuthContext";
import './App.css'

const RouterView: React.FC = () => {
    const {initialized, menus, redirectUrl, clearRedirect} = useAuth();

    const router = useMemo(() => createAppRouter(menus), [menus]);

    if (!initialized) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" description="正在初始化..."/>
            </div>
        );
    }

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
