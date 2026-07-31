import request from '@/utils/request';

export interface LoginParams {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data: Record<string, unknown>;
}

export default {
    login(params: LoginParams): Promise<LoginResponse> {
        return request.post('/auth/login', params);
    }
};
