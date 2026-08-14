import {type FC, useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Radio, Select, Space, Table, Tag,} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import userApi, {type User, type UserForm, type UserSearchForm} from '@/api/system/user';
import roleApi, {type SimpleRole} from '@/api/system/role';
import {Permission} from '@/components/Permission';
import {usePagedTable} from '@/hooks/usePagedTable';
import {useCrudModal} from '@/hooks/useCrudModal';
import {useBatchDelete} from '@/hooks/useBatchDelete';
import {auditColumns} from '@/components/AuditColumns';

const UserManagement: FC = () => {
    // 搜索
    const [searchForm] = Form.useForm<UserSearchForm>();

    // 表格
    const {
        loading,
        data,
        pagination,
        selectedRowKeys,
        setSelectedRowKeys,
        requestTableData,
        refreshTableData,
        reset,
        handleTableChange,
    } = usePagedTable<User, UserSearchForm>({
        read: userApi.read,
        searchForm,
    });

    // 删除
    const {deletingIds, deleteByIds} = useBatchDelete({
        deleteFn: userApi.delete,
        onSuccess: refreshTableData,
    });

    // 表单
    const {
        modalOpen,
        confirmLoading,
        form: userForm,
        openCreate,
        openEdit,
        close,
        submit,
    } = useCrudModal<UserForm>({
        create: userApi.create,
        update: userApi.update,
        onSuccess: refreshTableData,
    });

    // 通用
    const [roles, setRoles] = useState<SimpleRole[]>([]);
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

    useEffect(() => {
        requestRoles();
        requestTableData();
    }, []);

    function handleCreate() {
        openCreate({enabled: true, roleIdSet: []});
    }

    function handleUpdate(user: User) {
        openEdit({
            ...user,
            roleIdSet: user.roleSet.map(role => role.id),
        });
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
        ...auditColumns,
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
                        <Popconfirm title="确认删除该用户？" onConfirm={() => deleteByIds([user.id])}>
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
                        <Button type="primary" icon={<SearchOutlined/>} onClick={refreshTableData}>
                            搜索
                        </Button>
                        <Button icon={<ReloadOutlined/>} onClick={reset}>
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
                                    onConfirm={() => deleteByIds(selectedRowKeys as number[])}
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
                onOk={submit}
                onCancel={close}
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
