import request from '@/utils/request';
import type {Menu} from "@/api/system/menu.ts";
import type {BaseEntity} from "@/api/common.ts";
import {createCrudApi} from '@/api/crud';

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

export interface RoleSearchForm {
    label?: string | null;
}

export interface SimpleRole {
    id: number;
    label: string;
}

const crud = createCrudApi<Role, RoleForm, RoleSearchForm>('/system/role');

export default {
    ...crud,
    findAll(): Promise<SimpleRole[]> {
        return request.get('/system/role/findAll');
    },
}
