import React, {useEffect} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {Spin} from 'antd';
import {useAuth} from '@/store/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({children}) => {
    const {token, user, loading, fetchUserInfo} = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (token && !user) {
            fetchUserInfo();
        }
    }, [token, user, fetchUserInfo]);

    if (!token) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    return <>{children}</>;
};
