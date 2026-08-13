import type {Menu} from "@/api/menu.ts";
import type {BaseEntity, Pageable, PagedModel, Sort} from "@/api/common.ts";
import request from '@/utils/request';

export interface Role extends BaseEntity {
    label: string;
    value: string;
    menuSet: Menu[];
}

export interface RoleForm {
    id?: number;
    label: string;
    value: string;
    menuIdSet: number[];
}

export interface RoleQueryParam {
    label: string | null;
}

export interface RoleOption {
    id: number;
    label: string;
}

export default {
    findAll(): Promise<RoleOption[]> {
        return request.get('/system/role/findAll');
    },
    create(data: RoleForm): Promise<void> {
        return request.post('/system/role/create', data);
    },
    read(params: RoleQueryParam, pageable: Pageable, sort?: Sort): Promise<PagedModel<Role>> {
        return request.get('/system/role/read', {
            params: {
                ...params,
                ...pageable,
                ...(sort ? {sort: `${sort.property},${sort.direction}`} : {}),
            },
        });
    },
    update(data: RoleForm): Promise<void> {
        return request.post('/system/role/update', data);
    },
    delete(ids: number[]): Promise<void> {
        return request.post('/system/role/delete', ids);
    },
}
