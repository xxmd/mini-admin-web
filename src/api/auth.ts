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

export default {
    login(data: LoginForm): Promise<LoginResponse> {
        return request.post('/auth/login', data);
    },
};
