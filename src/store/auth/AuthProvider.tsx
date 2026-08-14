import React, {useCallback, useEffect, useState} from 'react';
import userApi, {type User} from '@/api/user';
import {AuthContext, type AuthContextValue, type AuthState} from "@/store/auth/AuthContext.ts";
import {type Menu, MenuType} from "@/api/menu.ts";

function getNavMenuFromUser(user: User): Menu[] {
    const flatMenus = user.roleSet.flatMap(role => role.menuSet);
    const distinctMenus = Array.from(new Map(flatMenus.map(menu => [menu.id, menu])).values());
    const navFlatMenus = distinctMenus.filter(menu => !menu.hidden && menu.type !== MenuType.BUTTON);
    return flatToTree(navFlatMenus);
}

function flatToTree(flatMenus: Menu[]): Menu[] {
    const childrenGroup = new Map<number, Menu[]>();
    for (const menu of flatMenus) {
        if (menu.parentId != null) {
            const group = childrenGroup.get(menu.parentId) ?? [];
            group.push(menu);
            childrenGroup.set(menu.parentId, group);
        }
    }

    const bySort = (a: Menu, b: Menu) => a.sort - b.sort;

    for (const menu of flatMenus) {
        const children = childrenGroup.get(menu.id);
        menu.hasChildren = children != null && children.length > 0;
        if (children) {
            menu.children = children.sort(bySort);
        }
    }

    return flatMenus
        .filter(menu => menu.parentId == null)
        .sort(bySort);
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [state, setState] = useState<AuthState>({
        token: localStorage.getItem('token'),
        user: null,
        menus: [],
        initialized: false,
        redirectUrl: null,
    });

    useEffect(() => {
        (async () => {
            if (state.token) {
                try {
                    const user = await userApi.get();
                    setState(prev => ({
                        ...prev,
                        user,
                        menus: getNavMenuFromUser(user),
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
                setState(prev => ({...prev, loading: false, initialized: true}));
            }
        })();
    }, []);

    const setToken = useCallback((token: string | null) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        setState(prev => ({...prev, token}));
    }, []);

    const login = useCallback(async (token: string, redirectUrl?: string) => {
        setToken(token);
        try {
            const user = await userApi.get();
            setState({
                token,
                user,
                menus: getNavMenuFromUser(user),
                initialized: true,
                redirectUrl: redirectUrl ?? null,
            });
        } catch (error) {
            console.error('Login fetch user info failed:', error);
        }
    }, [setToken]);

    const clearRedirect = useCallback(() => {
        setState(prev => ({...prev, redirectUrl: null}));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setState({
            token: null,
            user: null,
            menus: [],
            initialized: true,
            redirectUrl: null,
        });
    }, [setToken]);

    const refreshUser = useCallback(async () => {
        try {
            const user = await userApi.get();
            setState(prev => ({
                ...prev,
                user,
                menus: getNavMenuFromUser(user),
            }));
        } catch (error) {
            console.error('Failed to refresh user info:', error);
        }
    }, []);

    const value: AuthContextValue = {
        ...state,
        setToken,
        login,
        logout,
        clearRedirect,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
