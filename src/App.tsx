import React from 'react';
import {RouterProvider} from 'react-router-dom';
import {ConfigProvider, Spin} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {createAppRouter} from './router';
import {AuthProvider} from './store/auth/AuthProvider.tsx';
import {useAuth} from "@/store/auth/AuthContext.ts";
import './App.css'

const RouterView: React.FC = () => {
    const {initialized, menus} = useAuth();

    if (!initialized) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" description="正在初始化..."/>
            </div>
        );
    }

    const router = createAppRouter(menus);
    return <RouterProvider router={router}/>;
};

const App: React.FC = () => {
    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {},
            }}
        >
            <AuthProvider>
                <RouterView/>
            </AuthProvider>
        </ConfigProvider>
    );
};

export default App;
