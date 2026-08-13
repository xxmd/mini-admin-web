import request from '@/utils/request';
import type {BaseEntity, PagedModel} from "@/api/common.ts";

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
    id: number | null;
    parentId: number | null;
    type: MenuType;
    title: string;
    path: string | null;
    component: string | null;
    permission: string | null;
    sort: number;
    hidden: boolean;
}

export interface MenuQueryParam {
    parentId?: number | null;
}

export default {
    create(data: MenuForm): Promise<void> {
        return request.post('/system/menu/create', data);
    },
    read(data: MenuQueryParam): Promise<PagedModel<Menu>> {
        return request.post('/system/menu/read', data);
    },
    update(data: MenuForm): Promise<Menu[]> {
        return request.post('/system/menu/update', data);
    },
    delete(ids: number[]): Promise<void> {
        return request.post('/system/menu/delete', ids);
    },
    findAll(): Promise<Menu[]> {
        return request.get('/system/menu/findAll');
    },
};
