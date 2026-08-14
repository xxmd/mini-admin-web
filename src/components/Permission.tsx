import React from 'react';
import {useAuth} from '@/store/auth/AuthContext';

function usePermission() {
    const {user} = useAuth();
    const permissionSet = new Set(
        user?.roleSet.flatMap(role => role.menuSet)
            .map(menu => menu.permission) ?? [],
    );

    function hasPermission(permission: string): boolean {
        return permissionSet.has(permission);
    }

    return {hasPermission};
}

interface PermissionProps {
    permission: string;
    children: React.ReactNode;
}

export const Permission: React.FC<PermissionProps> = ({permission, children}) => {
    const {hasPermission} = usePermission();
    if (!hasPermission(permission)) return null;
    return <>{children}</>;
};
