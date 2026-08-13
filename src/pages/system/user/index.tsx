import React, {useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Radio, Select, Space, Table, Tag,} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import userApi, {type User, type UserForm, type UserSearchForm} from '@/api/user';
import roleApi, {type RoleOption} from '@/api/role';

const UserManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User[]>([]);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [searchForm] = Form.useForm<UserSearchForm>();
    const [userForm] = Form.useForm<UserForm>();

    const roleSelectOptions = useMemo(
        () => roleOptions.map(role => ({label: role.label, value: role.id})),
        [roleOptions],
    );

    function requestRoles() {
        roleApi.findAll().then(roles => {
            setRoleOptions(roles);
        }).catch(error => {
            void message.error('请求角色数据失败: ' + error);
        });
    }

    function requestTableData(page = 1, pageSize = 10) {
        const searchValues = searchForm.getFieldsValue();
        const params: UserSearchForm = {
            username: searchValues.username || null,
            nickname: searchValues.nickname || null,
            roleId: searchValues.roleId ?? null,
            enabled: searchValues.enabled ?? null,
        };
        userApi.read(params, {page: page - 1, size: pageSize}, {
            property: 'createdDate',
            direction: 'desc'
        }).then(pagedData => {
            setData(pagedData.content);
            setPagination({
                current: pagedData.page.number + 1,
                pageSize: pagedData.page.size,
                total: pagedData.page.totalElements,
            });
        }).catch(error => {
            void message.error('请求用户数据失败: ' + error);
        }).finally(() => {
            setLoading(false);
        });
    }

    function refreshTableData() {
        requestTableData(1, pagination.pageSize);
    }

    function handleReset() {
        searchForm.resetFields();
        refreshTableData();
    }

    useEffect(() => {
        requestRoles();
        requestTableData();
    }, []);

    function handleCreate() {
        userForm.resetFields();
        userForm.setFieldsValue({enabled: true, roleIdSet: []});
        setModalOpen(true);
    }

    function handleEdit(user: User) {
        userForm.resetFields();
        userForm.setFieldsValue({
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            enabled: user.enabled,
            roleIdSet: user.roleSet.map(role => role.id),
        });
        setModalOpen(true);
    }

    function handleDelete(ids: number[]) {
        setDeletingIds(ids);
        userApi.delete(ids).then(() => {
            void message.success('删除成功');
            if (ids.some(id => selectedRowKeys.includes(id))) {
                setSelectedRowKeys(prev => prev.filter(key => !ids.includes(key as number)));
            }
            refreshTableData();
        }).catch(error => {
            void message.error('删除失败: ' + error);
        }).finally(() => {
            setDeletingIds([]);
        });
    }

    const handleSubmit = async () => {
        try {
            const values = await userForm.validateFields();
            setConfirmLoading(true);
            const formData: UserForm = {
                ...values,
            };
            if (formData.id) {
                await userApi.update(formData);
                message.success('修改成功');
            } else {
                await userApi.create(formData);
                message.success('新增成功');
            }
            setModalOpen(false);
            refreshTableData();
        } catch {
            void message.error('表单提交失败');
        } finally {
            setConfirmLoading(false);
        }
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '昵称',
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: '角色',
            key: 'roleSet',
            render: (_: unknown, user: User) => (
                <>
                    {[...user.roleSet].map(role => (
                        <Tag key={role.id}>{role.label}</Tag>
                    ))}
                </>
            ),
        },
        {
            title: '状态',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => (
                <Tag color={enabled ? 'green' : 'red'}>{enabled ? '启用' : '禁用'}</Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, user: User) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEdit(user)}>
                        编辑
                    </Button>
                    <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete([user.id])}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                                loading={deletingIds.includes(user.id)}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Form form={searchForm} layout="inline" style={{marginBottom: 16}} autoComplete={'off'}>
                <Form.Item name="username" label="用户名">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item name="nickname" label="昵称">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item name="roleId" label="角色">
                    <Select
                        allowClear
                        options={roleSelectOptions}
                    />
                </Form.Item>
                <Form.Item name="enabled" label="状态">
                    <Select
                        style={{width: 200}}
                        allowClear
                        options={[
                            {value: true, label: '启用'},
                            {value: false, label: '禁用'},
                        ]}
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined/>} onClick={() => refreshTableData()}>
                            搜索
                        </Button>
                        <Button icon={<ReloadOutlined/>} onClick={handleReset}>
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            <div style={{marginBottom: 10}}>
                <Space>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
                        新增
                    </Button>
                    <Popconfirm title={`确认删除选中的 ${selectedRowKeys.length} 个用户？`}
                                onConfirm={() => handleDelete(selectedRowKeys as number[])}
                                disabled={selectedRowKeys.length === 0}>
                        <Button danger icon={<DeleteOutlined/>} disabled={selectedRowKeys.length === 0}>
                            批量删除
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            <div >
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: total => `共 ${total} 条`,
                        onChange: (page, pageSize) => requestTableData(page, pageSize),
                    }}
                />
            </div>

            <Modal
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                confirmLoading={confirmLoading}
                destroyOnHidden
            >
                <Form form={userForm} layout="horizontal" labelAlign="left" labelCol={{span: 4}} wrapperCol={{span: 18}}
                      style={{marginTop: 16}}>
                    <Form.Item name="id" hidden>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="username" label="用户名" rules={[{required: true, message: '请输入用户名'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="nickname" label="昵称" rules={[{required: true, message: '请输入昵称'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="enabled" label="状态" initialValue={true}>
                        <Radio.Group>
                            <Radio value={true}>启用</Radio>
                            <Radio value={false}>禁用</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="roleIdSet" label="角色">
                        <Select
                            mode="multiple"
                            allowClear
                            options={roleSelectOptions}
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
};

export default UserManagement;
