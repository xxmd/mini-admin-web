import React, {Suspense} from 'react';
import {Spin} from 'antd';
import {Outlet} from 'react-router-dom';

export const Content: React.FC = () => {
    return (
        <div className='layout-right-section layout-content' >
            <Suspense
                fallback={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Spin size="large"/>
                    </div>
                }
            >
                <Outlet/>
            </Suspense>
        </div>
    );
};
