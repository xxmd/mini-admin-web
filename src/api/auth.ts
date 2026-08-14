import request from '@/utils/request';

export interface LoginForm {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data: Record<string, unknown>;
}

const BASE_PATH = '/api/auth';

export default {
    login(data: LoginForm): Promise<LoginResponse> {
        return request.post(`${BASE_PATH}/login`, data);
    },
};
