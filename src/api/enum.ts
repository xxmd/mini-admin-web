import request from '@/utils/request';

export interface EnumOption {
    value: string;
    label: string;
}

export enum EnumName {
    MenuType = 'MenuType',
}

const BASE_PATH = '/enum';

export default {
    get(name: EnumName): Promise<EnumOption[]> {
        return request.get(`${BASE_PATH}/${name}`);
    },
};
