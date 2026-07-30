import {createBrowserRouter, Navigate} from 'react-router-dom';
import {BasicLayout} from '@/layouts/BasicLayout';
import {AuthGuard} from '@/components/AuthGuard'; // 引入路由守卫
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login/>,
    },
    {
        path: '/',
        // 用 AuthGuard 包裹 BasicLayout，这样下面的所有子路由（Dashboard 等）都会受保护
        element: (
            <AuthGuard>
                <BasicLayout/>
            </AuthGuard>
        ),
        children: [
            {path: '/', element: <Navigate to="/dashboard" replace/>},
            {path: 'dashboard', element: <Dashboard/>},
            // 后续新增的后台页面，都会自动被路由守卫拦截
        ],
    },
    {
        path: '*',
        element: <div>404 Not Found</div>,
    },
]);
