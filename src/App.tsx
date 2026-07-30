import React from 'react';
import {RouterProvider} from 'react-router-dom';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {router} from './router'; // 引入你配置好的 router 路由实例

const App: React.FC = () => {
    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: '#1677ff', // 可在此自定义全局主色调
                    borderRadius: 6,
                },
            }}
        >
            <RouterProvider router={router}/>
        </ConfigProvider>
    );
};

export default App;
