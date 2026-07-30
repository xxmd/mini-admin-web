import React from 'react';
import {RouterProvider} from 'react-router-dom';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {router} from './router';
import {AuthProvider} from '@/store/AuthContext';

const App: React.FC = () => {
    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: '#1677ff',
                    borderRadius: 6,
                },
            }}
        >
            <AuthProvider>
                <RouterProvider router={router}/>
            </AuthProvider>
        </ConfigProvider>
    );
};

export default App;
