import request from '@/utils/request';

export interface EnumOption {
    value: string;
    label: string;
}

export enum EnumName {
    MenuType = 'MenuType',
}

export default {
    get(name: EnumName): Promise<EnumOption[]> {
        return request.get(`/enum/${name}`);
    },
};
