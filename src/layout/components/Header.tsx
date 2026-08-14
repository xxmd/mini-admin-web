import React, {useMemo, useState} from 'react';
import {App, Breadcrumb, Dropdown, Form, Input, Modal} from 'antd';
import {EditOutlined, KeyOutlined, LogoutOutlined} from '@ant-design/icons';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '@/store/auth/AuthContext.ts';
import {type Menu} from '@/api/menu';
import userApi, {type UserPasswordForm, type UserProfileForm} from '@/api/user';

function findBreadcrumbPath(menus: Menu[], pathname: string, parentPath = ''): Menu[] {
    for (const menu of menus) {
        const fullPath = parentPath + '/' + menu.path;
        if (fullPath === pathname) {
            return [menu];
        }
        if (menu.hasChildren) {
            const childPath = findBreadcrumbPath(menu.children!, pathname, fullPath);
            if (childPath.length > 0) {
                return [menu, ...childPath];
            }
        }
    }
    return [];
}

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, logout, menus, refreshUser} = useAuth();
    const {message} = App.useApp();
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [profileForm] = Form.useForm<UserProfileForm>();
    const [passwordForm] = Form.useForm<UserPasswordForm>();

    const breadcrumbItems = useMemo(() => {
        const path = findBreadcrumbPath(menus, location.pathname);
        if (path.length > 0) {
            return path.map(menu => ({title: menu.title}));
        }
        if (location.pathname.startsWith('/dashboard')) {
            return [{title: '仪表盘'}];
        }
        return [];
    }, [menus, location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login', {replace: true});
    };

    const handleEditProfile = () => {
        profileForm.resetFields();
        profileForm.setFieldsValue({username: user?.username, nickname: user?.nickname});
        setProfileModalOpen(true);
    };

    const handleProfileSubmit = async () => {
        try {
            const values = await profileForm.validateFields();
            setConfirmLoading(true);
            await userApi.updateProfile(values);
            await refreshUser();
            message.success('修改成功');
            setProfileModalOpen(false);
        } finally {
            setConfirmLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        const values = await passwordForm.validateFields();
        try {
            setConfirmLoading(true);
            await userApi.updatePassword(values);
            message.success('密码修改成功，请重新登录');
            setPasswordModalOpen(false);
            logout();
            navigate('/login', {replace: true});
        } catch {
            message.error('密码修改失败');
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <div className="layout-right-section layout-header">
            <Breadcrumb items={breadcrumbItems}/>
            <Dropdown menu={{
                items: [
                    {key: 'editProfile', icon: <EditOutlined/>, label: '修改信息', onClick: handleEditProfile},
                    {
                        key: 'changePassword',
                        icon: <KeyOutlined/>,
                        label: '修改密码',
                        onClick: () => setPasswordModalOpen(true)
                    },
                    {type: 'divider'},
                    {key: 'logout', icon: <LogoutOutlined/>, label: '退出登录', onClick: handleLogout},
                ],
            }}>
                <span style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                    <span>{user?.nickname || '默认昵称'}</span>
                </span>
            </Dropdown>

            <Modal
                title="修改信息"
                open={profileModalOpen}
                onOk={handleProfileSubmit}
                onCancel={() => setProfileModalOpen(false)}
                confirmLoading={confirmLoading}
                destroyOnHidden
            >
                <Form form={profileForm} layout="horizontal" labelAlign="left" labelCol={{span: 4}}
                      wrapperCol={{span: 18}}
                      style={{marginTop: 16}} autoComplete="off">
                    <Form.Item name="username" label="用户名" rules={[
                        {required: true, message: '请输入用户名'},
                        {
                            validator: async (_, value) => {
                                if (!value) return;
                                const existingUser = await userApi.findByUsername(value);
                                if (existingUser && existingUser.id !== user?.id) {
                                    return Promise.reject('该用户名已存在');
                                }
                            },
                        },
                    ]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="nickname" label="昵称" rules={[{required: true, message: '请输入昵称'}]}>
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="修改密码"
                open={passwordModalOpen}
                onOk={handlePasswordSubmit}
                onCancel={() => setPasswordModalOpen(false)}
                confirmLoading={confirmLoading}
                destroyOnHidden
            >
                <Form form={passwordForm} layout="horizontal" labelAlign="left" labelCol={{span: 6}}
                      wrapperCol={{span: 16}}
                      style={{marginTop: 16}} autoComplete="off">
                    <Form.Item name="srcPassword" label="原密码" rules={[{required: true, message: '请输入原密码'}]}>
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item name="newPassword" label="新密码" rules={[{required: true, message: '请输入新密码'}]}>
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item name="confirmPassword" label="确认密码" dependencies={['newPassword']}
                               rules={[
                                   {required: true, message: '请确认新密码'},
                                   ({getFieldValue}) => ({
                                       validator(_, value) {
                                           if (!value || getFieldValue('newPassword') === value) {
                                               return Promise.resolve();
                                           }
                                           return Promise.reject(new Error('两次输入的密码不一致'));
                                       },
                                   }),
                               ]}>
                        <Input.Password/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
