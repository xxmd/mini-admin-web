import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import userApi, {type User} from '@/api/user';
import {type Menu, MenuType} from '@/api/menu';

interface AuthState {
    token: string | null;
    user: User | null;
    menus: Menu[];
    loading: boolean;
}

interface AuthContextValue extends AuthState {
    setToken: (token: string | null) => void;
    login: (token: string) => Promise<void>;
    fetchUserInfo: () => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 过滤并转换平铺菜单为树形结构
 * 1. 去重
 * 2. 过滤 hidden === true 以及 type === MenuType.BUTTON
 * 3. 根据 parentId 构建树形层级
 * 4. 按 sort 属性升序排序
 */
function buildMenuTree(flatMenus: Menu[]): Menu[] {
    // 1. 去重（使用 Map 根据 id 去重）
    const menuMap = new Map<number, Menu>();
    flatMenus.forEach(item => {
        if (!menuMap.has(item.id)) {
            menuMap.set(item.id, item);
        }
    });

    // 2. 过滤 hidden 和 BUTTON
    const filteredList = Array.from(menuMap.values()).filter(
        item => !item.hidden && item.type !== MenuType.BUTTON
    );

    // 3. 构建节点 Map（进行深拷贝并添加 children 数组）
    const nodeMap: Record<number, Menu> = {};
    filteredList.forEach(item => {
        nodeMap[item.id] = { ...item, children: [] };
    });

    // 4. 组装成树结构
    const tree: Menu[] = [];
    filteredList.forEach(item => {
        const node = nodeMap[item.id];
        if (item.parentId && nodeMap[item.parentId]) {
            nodeMap[item.parentId].children!.push(node);
        } else {
            tree.push(node);
        }
    });

    // 5. 层级排序
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

/**
 * 从 User 对象的 roleSet 中提取所有 Menu 并转换为树状结构
 */
function extractMenusFromUser(user: User): Menu[] {
    const allMenus: Menu[] = [];
    if (user.roleSet) {
        // user.roleSet 可能是 Array 或 Set
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [state, setState] = useState<AuthState>({
        token: localStorage.getItem('token'),
        user: null,
        menus: [],
        loading: true,
    });

    // 设置 Token 的底层方法
    const setToken = useCallback((token: string | null) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        setState(prev => ({...prev, token}));
    }, []);

    // 获取用户信息（同时提取角色和菜单树）
    const fetchUserInfo = useCallback(async () => {
        try {
            const user = await userApi.get();
            const treeMenus = extractMenusFromUser(user);
            setState(prev => ({
                ...prev,
                user: user,
                menus: treeMenus,
            }));
            return user;
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            return null;
        }
    }, []);

    // 登录成功后拉取用户信息与菜单
    const login = useCallback(async (token: string) => {
        setToken(token);
        setState(prev => ({...prev, loading: true}));
        try {
            await fetchUserInfo();
        } finally {
            setState(prev => ({...prev, loading: false}));
        }
    }, [setToken, fetchUserInfo]);

    const logout = useCallback(() => {
        setToken(null);
        setState({token: null, user: null, menus: [], loading: false});
    }, [setToken]);

    // 应用初始化挂载时检查 Token 并获取用户信息
    useEffect(() => {
        const init = async () => {
            if (state.token) {
                await fetchUserInfo();
            }
            setState(prev => ({...prev, loading: false}));
        };
        init();
    }, [state.token, fetchUserInfo]);

    const value: AuthContextValue = {
        ...state,
        setToken,
        login,
        fetchUserInfo,
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
