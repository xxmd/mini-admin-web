import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器
request.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            message.error('登录失效，请重新登录');
            window.location.href = '/login';
        } else {
            message.error(error.message || '网络请求错误');
        }
        return Promise.reject(error);
    }
);

export default request;
