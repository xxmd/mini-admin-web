import React from 'react';
import {usePermission} from '@/hooks/usePermission';

interface PermissionProps {
    permission: string;
    children: React.ReactNode;
}

export const Permission: React.FC<PermissionProps> = ({permission, children}) => {
    const {hasPermission} = usePermission();
    if (!hasPermission(permission)) return null;
    return <>{children}</>;
};
