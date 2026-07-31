import React, {useState} from 'react';
import {Form, Input, Button, Card, message} from 'antd';
import {UserOutlined, LockOutlined} from '@ant-design/icons';
import {useNavigate, useLocation} from 'react-router-dom';
import authApi, {type LoginResponse} from '@/api/auth';
import {useAuth} from '@/store/AuthContext';

// 定义表单字段类型
interface LoginFormField {
    username?: string;
    password?: string;
}

const Login: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {setToken} = useAuth();

    const redirectUrl = (location.state as { from?: string })?.from || '/dashboard';

    const onFinish = async (values: LoginFormField) => {
        setLoading(true);
        try {
            const res: LoginResponse = await authApi.login({
                username: values.username!,
                password: values.password!,
            });
            if (res.success) {
                message.success('登录成功！');
                setToken(res.data?.token as string);
                navigate(redirectUrl, {replace: true});
            } else {
                message.error(res.message || '登录失败，请稍后重试');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err) {
                const axiosErr = err as { code?: string; response?: { status: number } };
                if (axiosErr.code === 'ECONNABORTED') {
                    message.error('请求超时，请检查网络后重试');
                } else if (axiosErr.response?.status === 500) {
                    message.error('服务器异常，请稍后重试');
                } else if (axiosErr.response?.status === 403) {
                    message.error('没有访问权限，请联系管理员');
                } else {
                    message.error('网络请求失败，请稍后重试');
                }
            } else {
                message.error('网络请求失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#f0f2f5',
            }}
        >
            <Card
                title="系统登录"
                style={{
                    width: 380,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                headStyle={{
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                }}
            >
                <Form
                    form={form}
                    name="login_form"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{required: true, message: '用户名不能为空'}]}
                    >
                        <Input
                            prefix={<UserOutlined style={{color: 'rgba(0,0,0,0.25)'}}/>}
                            placeholder="用户名"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{required: true, message: '密码不能为空'}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{color: 'rgba(0,0,0,0.25)'}}/>}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item style={{marginBottom: 0}}>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            登 录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
