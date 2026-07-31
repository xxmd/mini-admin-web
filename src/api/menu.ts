import request from '@/utils/request';

// 1. 使用 enum 定义 MenuType
export enum MenuType {
    CATEGORY = 'CATEGORY',
    MENU = 'MENU',
    BUTTON = 'BUTTON',
}

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

export default {
};
