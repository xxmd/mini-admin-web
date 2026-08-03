import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import userApi, {type User} from '@/api/user';
import {type Menu, MenuType} from '@/api/menu';
import {generateRoutes} from '@/utils/routeGenerator';
import type {RouteObject} from 'react-router-dom';

interface AuthState {
    token: string | null;
    user: User | null;
    menus: Menu[];
    dynamicRoutes: RouteObject[];
    loading: boolean;
    initialized: boolean;
}

interface AuthContextValue extends AuthState {
    setToken: (token: string | null) => void;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildMenuTree(flatMenus: Menu[]): Menu[] {
    const menuMap = new Map<number, Menu>();
    flatMenus.forEach(item => {
        if (!menuMap.has(item.id)) {
            menuMap.set(item.id, item);
        }
    });

    const filteredList = Array.from(menuMap.values()).filter(
        item => !item.hidden && item.type !== MenuType.BUTTON
    );

    const nodeMap: Record<number, Menu> = {};
    filteredList.forEach(item => {
        nodeMap[item.id] = { ...item, children: [] };
    });

    const tree: Menu[] = [];
    filteredList.forEach(item => {
        const node = nodeMap[item.id];
        if (item.parentId && nodeMap[item.parentId]) {
            nodeMap[item.parentId].children!.push(node);
        } else {
            tree.push(node);
        }
    });

    const sortNodes = (nodes: Menu[]) => {
        nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                sortNodes(node.children);
            }
        });
    };
    sortNodes(tree);

    return tree;
}

function extractMenusFromUser(user: User): Menu[] {
    const allMenus: Menu[] = [];
    if (user.roleSet) {
        const roles = Array.from(user.roleSet);
        roles.forEach(role => {
            if (role.menuSet) {
                const roleMenus = Array.from(role.menuSet);
                allMenus.push(...roleMenus);
            }
        });
    }
    return buildMenuTree(allMenus);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, setState] = useState<AuthState>({
        token: localStorage.getItem('token'),
        user: null,
        menus: [],
        dynamicRoutes: [],
        loading: true,
        initialized: false,
    });

    // 应用挂载时预初始化：有 token 则拉取用户信息和菜单，构建动态路由
    useEffect(() => {
        (async () => {
            if (state.token) {
                try {
                    const user = await userApi.get();
                    const treeMenus = extractMenusFromUser(user);
                    const routes = generateRoutes(treeMenus);
                    setState(prev => ({
                        ...prev,
                        user,
                        menus: treeMenus,
                        dynamicRoutes: routes,
                        loading: false,
                        initialized: true,
                    }));
                } catch (error) {
                    console.error('Failed to init auth:', error);
                    localStorage.removeItem('token');
                    setState(prev => ({
                        ...prev,
                        token: null,
                        loading: false,
                        initialized: true,
                    }));
                }
            } else {
                setState(prev => ({ ...prev, loading: false, initialized: true }));
            }
        })();
    }, []);

    const setToken = useCallback((token: string | null) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        setState(prev => ({ ...prev, token }));
    }, []);

    const login = useCallback(async (token: string) => {
        setToken(token);
        try {
            const user = await userApi.get();
            const treeMenus = extractMenusFromUser(user);
            const routes = generateRoutes(treeMenus);
            setState({
                token,
                user,
                menus: treeMenus,
                dynamicRoutes: routes,
                loading: false,
                initialized: true,
            });
        } catch (error) {
            console.error('Login fetch user info failed:', error);
        }
    }, [setToken]);

    const logout = useCallback(() => {
        setToken(null);
        setState({
            token: null,
            user: null,
            menus: [],
            dynamicRoutes: [],
            loading: false,
            initialized: true,
        });
    }, [setToken]);

    const value: AuthContextValue = {
        ...state,
        setToken,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
