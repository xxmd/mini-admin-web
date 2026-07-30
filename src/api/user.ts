import request from '@/utils/request';

export interface UserDetail {
    id: number;
    username: string;
    nickname: string;
    roleSet: string[];
    permissionSet: string[];
}

export interface MenuItem {
    key: string;
    icon?: string;
    label: string;
    children?: MenuItem[];
}

export function getUserDetailApi(): Promise<UserDetail> {
    return request.get('/system/user/detail');
}
