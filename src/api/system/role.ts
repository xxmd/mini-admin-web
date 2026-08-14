import request from '@/utils/request';
import type {Menu} from "@/api/system/menu";
import type {BaseEntity} from "@/api/common";
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

const BASE_PATH = '/api/system/role';

const crud = createCrudApi<Role, RoleForm, RoleSearchForm>(BASE_PATH);

export default {
    ...crud,
    findAll(): Promise<SimpleRole[]> {
        return request.get(`${BASE_PATH}/findAll`);
    },
}
