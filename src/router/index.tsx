import {createBrowserRouter, Navigate, redirect} from 'react-router-dom';
import type {RouteObject} from 'react-router-dom';
import {BasicLayout} from '@/layouts/BasicLayout';
import {AuthGuard} from '@/components/AuthGuard';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

export function createAppRouter(dynamicRoutes: RouteObject[] = []) {
    return createBrowserRouter([
        {
            path: '/login',
            loader: () => {
                const token = localStorage.getItem('token');
                if (token) {
                    throw redirect('/');
                }
                return null;
            },
            element: <Login />,
        },
        {
            id: 'root',
            path: '/',
            element: (
                <AuthGuard>
                    <BasicLayout />
                </AuthGuard>
            ),
            children: [
                { index: true, element: <Navigate to="/dashboard" replace /> },
                { path: 'dashboard', element: <Dashboard /> },
                ...dynamicRoutes,
                { path: '*', element: <div style={{ padding: 24 }}>404 Not Found</div> },
            ],
        },
    ]);
}
