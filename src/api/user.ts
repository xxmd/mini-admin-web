import request from '@/utils/request';
import type {Role} from "@/api/role.ts";
import type {BaseEntity} from "@/api/common.ts";
import {createCrudApi} from '@/api/crud';

export interface User extends BaseEntity {
    username: string;
    nickname: string;
    enabled: boolean;
    roleSet: Role[];
}

export interface UserForm {
    id?: number;
    username: string;
    nickname: string;
    enabled: boolean;
    roleIdSet: number[];
}

export interface UserSearchForm {
    username?: string | null;
    nickname?: string | null;
    roleId?: number | null;
    enabled?: boolean | null;
}

export interface UserProfileForm {
    username: string;
    nickname: string;
}

export interface UserPasswordForm {
    srcPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const BASE_PATH = '/system/user';


const crud = createCrudApi<User, UserForm, UserSearchForm>(BASE_PATH);


export default {
    ...crud,
    get(): Promise<User> {
        return request.get(BASE_PATH);
    },
    findByUsername(username: string): Promise<User | null> {
        return request.get(`${BASE_PATH}/findByUsername/${username}`);
    },
    updateProfile(data: UserProfileForm): Promise<void> {
        return request.post(`${BASE_PATH}/updateProfile`, data);
    },
    updatePassword(data: UserPasswordForm): Promise<void> {
        return request.post(`${BASE_PATH}/updatePassword`, data);
    },
}
