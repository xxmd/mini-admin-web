import request from '@/utils/request';
import type {Role} from "@/api/role.ts";
import type {BaseEntity, Pageable, PagedModel, Sort} from "@/api/common.ts";

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

export default {
    get(): Promise<User> {
        return request.get('/system/user');
    },
    create(data: UserForm): Promise<void> {
        return request.post('/system/user/create', data);
    },
    read(params: UserSearchForm, pageable: Pageable, sort?: Sort): Promise<PagedModel<User>> {
        return request.get('/system/user/read', {
            params: {
                ...params,
                page: pageable.page,
                size: pageable.size,
                ...(sort ? {sort: `${sort.property},${sort.direction}`} : {}),
            },
        });
    },
    update(data: UserForm): Promise<void> {
        return request.post('/system/user/update', data);
    },
    delete(ids: number[]): Promise<void> {
        return request.post('/system/user/delete', ids);
    },
}
