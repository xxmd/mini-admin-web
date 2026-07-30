import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    // 如果没有 token，跳转到登录页，并通过 state 记录当前尝试访问的页面
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 有 token，正常渲染受保护的子组件/布局
    return <>{children}</>;
};
