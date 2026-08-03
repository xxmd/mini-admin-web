import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '@/store/AuthContext';
import {Spin} from 'antd';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({children}) => {
    const {token, user} = useAuth();
    const location = useLocation();

    if (!token) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{from: location}}
                         replace/>;
    }

    if (!user) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" tip="加载菜单与权限中..."/>
            </div>
        );
    }

    return <>{children}</>;
};
