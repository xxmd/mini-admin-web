import {type FC, useEffect, useMemo, useState} from 'react';
import {Form, Input, message, Radio, Select, Table, Tag,} from 'antd';
import userApi, {type User, type UserForm, type UserSearchForm} from '@/api/system/user';
import roleApi, {type SimpleRole} from '@/api/system/role';
import {SearchForm} from '@/components/crud/SearchForm';
import {Toolbar} from '@/components/crud/Toolbar';
import {CrudModal} from '@/components/crud/CrudModal';
import {CrudLayout} from '@/components/crud/CrudLayout';
import {createActionColumn} from '@/components/crud/ActionColumn';
import {useCrudPage} from '@/hooks/useCrudPage';
import {auditColumns} from '@/components/crud/AuditColumns';

const UserManagement: FC = () => {
    // 搜索
    const [searchForm] = Form.useForm<UserSearchForm>();

    // 表格 + 表单 + 删除
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
        deletingIds,
        deleteByIds,
        modalOpen,
        confirmLoading,
        form: userForm,
        openCreate,
        openEdit,
        close,
        submit,
    } = useCrudPage<User, UserForm, UserSearchForm>({
        api: userApi,
        searchForm,
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
        createActionColumn<User>({
            entityName: '用户',
            updatePermission: 'system:user:update',
            deletePermission: 'system:user:delete',
            onEdit: handleUpdate,
            onDelete: id => deleteByIds([id]),
            deletingIds,
        }),
    ];

    return (
        <CrudLayout>
            <SearchForm form={searchForm} onSearch={refreshTableData} onReset={reset}>
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
            </SearchForm>

            <Toolbar
                createPermission="system:user:create"
                deletePermission="system:user:delete"
                onCreate={handleCreate}
                onRefresh={refreshTableData}
                entityName="用户"
                selectedCount={selectedRowKeys.length}
                onBatchDelete={() => deleteByIds(selectedRowKeys as number[])}
            />

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

            <CrudModal open={modalOpen} confirmLoading={confirmLoading} onOk={submit} onCancel={close} form={userForm}>
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
            </CrudModal>
        </CrudLayout>
    );
};

export default UserManagement;
