import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Radio, Select, Space, Table, Tag,} from 'antd';
import type {SorterResult, TablePaginationConfig} from 'antd/es/table/interface';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import userApi, {type User, type UserForm, type UserSearchForm} from '@/api/user';
import roleApi, {type SimpleRole} from '@/api/role';
import type {Sort} from '@/api/common';
import {Permission} from '@/components/Permission';

const UserManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User[]>([]);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [roles, setRoles] = useState<SimpleRole[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: 'createdDate', direction: 'desc'}]);
    const [searchForm] = Form.useForm<UserSearchForm>();
    const [userForm] = Form.useForm<UserForm>();

    const roleOptions = useMemo(
        () => roles.map(role => ({label: role.label, value: role.id})),
        [roles],
    );

    function requestRoles() {
        roleApi.findAll().then(roles => {
            setRoles(roles);
        }).catch(error => {
            void message.error('请求角色数据失败: ' + error);
        });
    }

    const requestTableData = useCallback((page = 1, pageSize = 10, currentSorts?: Sort[]) => {
        userApi.read(searchForm.getFieldsValue(), {
            page: page,
            size: pageSize
        }, currentSorts ?? sorts).then(pagedData => {
            setData(pagedData.content);
            setPagination({
                current: pagedData.page.number + 1,
                pageSize: pagedData.page.size,
                total: pagedData.page.totalElements,
            });
        }).finally(() => {
            setLoading(false);
        });
    }, [searchForm, sorts]);

    function refreshTableData() {
        setLoading(true);
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

    function handleUpdate(user: User) {
        userForm.resetFields();
        userForm.setFieldsValue({
            ...user,
            roleIdSet: user.roleSet.map(role => role.id),
        });
        setModalOpen(true);
    }

    async function handleDelete(ids: number[]) {
        try {
            setDeletingIds(ids);
            await userApi.delete(ids);
            refreshTableData();
        } finally {
            setDeletingIds([]);
        }
    }

    async function handleSubmit() {
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
        } finally {
            setConfirmLoading(false);
        }
    }

    function handleTableChange(_pagination: TablePaginationConfig, _filters: Record<string, unknown>, sorter: SorterResult<User> | SorterResult<User>[]) {
        const sorterList = Array.isArray(sorter) ? sorter : [sorter];
        const newSorts: Sort[] = sorterList
            .filter(s => s.order)
            .map(s => ({
                property: (s.columnKey as string) || (s.field as string),
                direction: s.order === 'ascend' ? 'asc' : 'desc',
            }));
        if (newSorts.length === 0) {
            newSorts.push({property: 'createdDate', direction: 'desc'});
        }
        setSorts(newSorts);
        setLoading(true);
        requestTableData(_pagination.current ?? 1, _pagination.pageSize ?? 10, newSorts);
    }

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
            title: '创建时间',
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: true,
            render: (val: Date) => val ? new Date(val).toLocaleString() : '-',
        },
        {
            title: '创建者',
            dataIndex: 'createdBy',
            key: 'createdBy',
            render: (val: string) => val || '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modifiedDate',
            key: 'modifiedDate',
            sorter: true,
            render: (val: Date) => val ? new Date(val).toLocaleString() : '-',
        },
        {
            title: '修改者',
            dataIndex: 'modifiedBy',
            key: 'modifiedBy',
            render: (val: string) => val || '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, user: User) => (
                <Space>
                    <Permission permission="system:user:update">
                        <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleUpdate(user)}>
                            编辑
                        </Button>
                    </Permission>
                    <Permission permission="system:user:delete">
                        <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete([user.id])}>
                            <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                                    loading={deletingIds.includes(user.id)}>
                                删除
                            </Button>
                        </Popconfirm>
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Form form={searchForm} layout="inline" autoComplete={'off'}>
                <Form.Item name="username" label="用户名">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item name="nickname" label="昵称">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item name="roleId" label="角色">
                    <Select
                        allowClear
                        options={roleOptions}
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

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Space>
                    <Permission permission="system:user:create">
                        <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
                            新增
                        </Button>
                    </Permission>
                    <Permission permission="system:user:delete">
                        <Popconfirm title={`确认删除选中的 ${selectedRowKeys.length} 个用户？`}
                                    onConfirm={() => handleDelete(selectedRowKeys as number[])}
                                    disabled={selectedRowKeys.length === 0}>
                            <Button danger icon={<DeleteOutlined/>} disabled={selectedRowKeys.length === 0}>
                                删除
                            </Button>
                        </Popconfirm>
                    </Permission>
                </Space>
                <Button icon={<ReloadOutlined/>} onClick={refreshTableData}/>
            </div>

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
                onChange={handleTableChange}
            />

            <Modal
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                confirmLoading={confirmLoading}
                destroyOnHidden
            >
                <Form form={userForm} layout="horizontal" labelAlign="left" labelCol={{span: 4}} wrapperCol={{span: 18}}
                      style={{marginTop: 16}} autoComplete="off">
                    <Form.Item name="id" hidden>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="username" label="用户名" rules={[
                        {required: true, message: '请输入用户名'},
                        {
                            validator: async (_, value) => {
                                if (!value) return;
                                const existingUser = await userApi.findByUsername(value);
                                if (existingUser && existingUser.id !== userForm.getFieldValue('id')) {
                                    return Promise.reject('用户名已存在');
                                }
                            },
                        },
                    ]}>
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
                            options={roleOptions}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
