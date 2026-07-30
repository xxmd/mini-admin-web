import request from '@/utils/request';

export interface LoginParams {
    username: string;
    password: string;
}

export enum FailReason {
    USERNAME_EMPTY = 'USERNAME_EMPTY',
    PASSWORD_EMPTY = 'PASSWORD_EMPTY',
    USERNAME_DISABLED = 'USERNAME_DISABLED',
    USERNAME_OR_PASSWORD_ERROR = 'USERNAME_OR_PASSWORD_ERROR',
}

export interface UserLoginResponse {
    success: boolean;
    reason?: FailReason;
    message?: string;
    data: Record<string, unknown>;
}

export function loginApi(params: LoginParams): Promise<UserLoginResponse> {
    return request.post('/auth/login', params);
}
