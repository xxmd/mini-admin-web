import axios from 'axios';
import { message } from 'antd';
import { router } from '@/router';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000, // updated to include default empty string when needed
});

// 请求拦截器
request.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// 响应拦截器
request.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
                // 1. 清空本地存储
                localStorage.removeItem('token');

                // 2. 提示用户
                message.error('登录已过期，请重新登录');

                // 3. 跳转到登录页
                // 注意：由于无法在非组件中使用 useNavigate，我们使用 router.navigate
                router.navigate('/login', { replace: true });

                // 4. 可选：如果需要彻底重置内存中的 AuthContext 状态，可以强制刷新
                // window.location.reload();
        } else {
            message.error(error.message || '网络请求错误');
        }
        return Promise.reject(error);
    }
);

export default request;
