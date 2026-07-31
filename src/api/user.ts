import request from '@/utils/request';
import type {Role} from "@/api/role.ts";

export interface User {
    id: number;
    username: string;
    nickname: string;
    roleSet: Set<Role>;
}

export default {
    get(): Promise<User> {
        return request.get('/system/user');
    }
}
