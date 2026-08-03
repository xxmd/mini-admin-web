import request from '@/utils/request';
import type {PagedModel} from "@/api/common.ts";

// 1. 使用 enum 定义 MenuType
export const MenuType = {
    CATEGORY: 'CATEGORY',
    MENU: 'MENU',
    BUTTON: 'BUTTON',
} as const;

export type MenuType = typeof MenuType[keyof typeof MenuType];

export interface Menu {
    id: number;
    parentId: number | null;
    type: MenuType;
    title: string;
    path: string;
    component: string;
    permission: string;
    sort: number;
    hidden: boolean;
    children: Menu[]
}

export interface MenuForm {
    id?: number;
    parentId?: number | null;
    type: MenuType;
    title: string;
    path: string;
    component?: string;
    permission?: string;
    sort?: number;
    hidden?: boolean;
}

export interface QueryParam {
    parentId?: number | null;
}

export default {
    create(data: MenuForm): Promise<void> {
        return request.post('/system/menu/create', data);
    },
    read(data: QueryParam): Promise<PagedModel<Menu>> {
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
