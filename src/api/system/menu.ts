import request from '@/utils/request';
import type {BaseEntity} from "@/api/common";
import {createCrudApi} from "@/api/crud";

export enum MenuType {
    CATEGORY = 'CATEGORY',
    MENU = 'MENU',
    BUTTON = 'BUTTON',
}

export interface Menu extends BaseEntity {
    parentId: number | null;
    type: MenuType;
    title: string;
    path: string;
    component: string | null;
    permission: string | null;
    sort: number;
    hidden: boolean;
    hasChildren: boolean;
    children?: Menu[];
}

export interface MenuForm {
    id?: number;
    parentId: number | null;
    type: MenuType;
    title: string;
    path: string | null;
    component: string | null;
    permission: string | null;
    sort: number;
    hidden: boolean;
}

export interface MenuSearchForm {
    parentId?: number | null;
}

const crud = createCrudApi<Menu, MenuForm, MenuSearchForm>('/system/menu');

export default {
    ...crud,
    findAll(): Promise<Menu[]> {
        return request.get('/system/menu/findAll');
    },
}
