import {createBrowserRouter, Navigate, redirect} from 'react-router-dom';
import type {RouteObject} from 'react-router-dom';
import {Layout} from '@/layout';
import {AuthGuard} from '@/components/AuthGuard';
import Login from '@/pages/Login';
import Welcome from '@/pages/Welcome';
import {buildDynamicRoutes} from "@/router/dynamicRoutes.tsx";
import type {Menu} from "@/api/menu.ts";

const NotFound = () => <div style={{padding: 24}}>404 Not Found</div>;

function buildStaticRoutes(): RouteObject[] {
    return [
        {index: true, element: <Navigate to="/welcome" replace/>},
        {path: 'welcome', element: <Welcome/>},
    ];
}

function buildFallbackRoutes(): RouteObject[] {
    return [
        {path: '*', element: <NotFound/>},
    ];
}

export function createAppRouter(menus: Menu[]) {
    const rootRoute: RouteObject = {
        id: 'root',
        path: '/',
        element: (
            <AuthGuard>
                <Layout/>
            </AuthGuard>
        ),
        children: [
            ...buildStaticRoutes(),
            ...(buildDynamicRoutes(menus)),
            ...buildFallbackRoutes(),
        ],
    };

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
            element: <Login/>,
        },
        rootRoute,
    ]);
}
