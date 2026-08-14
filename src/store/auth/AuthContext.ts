import {createContext, useContext} from 'react';
import {type User} from '@/api/user';
import type {Menu} from "@/api/menu.ts";

export interface AuthState {
    token: string | null;
    user: User | null;
    menus: Menu[];
    initialized: boolean;
    redirectUrl: string | null;
}

export interface AuthContextValue extends AuthState {
    setToken: (token: string | null) => void;
    login: (token: string, redirectUrl?: string) => Promise<void>;
    logout: () => void;
    clearRedirect: () => void;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return <AuthContextValue>context;
}

