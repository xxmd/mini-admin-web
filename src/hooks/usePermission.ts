import {useAuth} from '@/store/auth/AuthContext';

export function usePermission() {
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
