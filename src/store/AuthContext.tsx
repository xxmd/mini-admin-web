import React, {createContext, useContext, useState, useCallback} from 'react';
import {getUserDetailApi, type UserDetail, type MenuItem} from '@/api/user';

interface AuthState {
    token: string | null;
    user: UserDetail | null;
    menus: MenuItem[];
    loading: boolean;
}

interface AuthContextValue extends AuthState {
    setToken: (token: string | null) => void;
    fetchUserInfo: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [state, setState] = useState<AuthState>({
        token: localStorage.getItem('token'),
        user: null,
        menus: [],
        loading: false,
    });

    const setToken = useCallback((token: string | null) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        setState(prev => ({...prev, token}));
    }, []);

    const fetchUserInfo = useCallback(async () => {
        if (!state.token || state.user) return;
        setState(prev => ({...prev, loading: true}));
        try {
            const userDetail = await getUserDetailApi();
            setState(prev => ({
                ...prev,
                user: userDetail,
                loading: false,
            }));
            // TODO: 菜单接口就绪后，在此处请求菜单数据并更新 menus
        } catch {
            setState(prev => ({...prev, loading: false}));
        }
    }, [state.token, state.user]);

    const logout = useCallback(() => {
        setToken(null);
        setState({token: null, user: null, menus: [], loading: false});
    }, [setToken]);

    return (
        <AuthContext.Provider value={{...state, setToken, fetchUserInfo, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
