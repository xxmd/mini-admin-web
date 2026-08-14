import {type FC, type Key, useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Space, Table, Tree} from 'antd';
import type {DataNode} from 'antd/es/tree';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import roleApi, {type Role, type RoleForm, type RoleSearchForm} from '@/api/system/role';
import menuApi, {type Menu} from '@/api/system/menu';
import type {Pageable, Sort} from '@/api/common';
import {Permission} from '@/components/Permission';
import {usePagedTable} from '@/hooks/usePagedTable';
import {useCrudModal} from '@/hooks/useCrudModal';
import {useBatchDelete} from '@/hooks/useBatchDelete';
import {auditColumns} from '@/components/AuditColumns';

const RoleManagement: FC = () => {
    // 搜索
    const [searchForm] = Form.useForm<RoleSearchForm>();

    // 表格
    const read = useCallback((search: RoleSearchForm, pageable: Pageable, sorts?: Sort[]) =>
        roleApi.read({label: search.label ?? null}, pageable, sorts), []);
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
    } = usePagedTable<Role, RoleSearchForm>({read, searchForm});

    // 删除
    const {deletingIds, deleteByIds} = useBatchDelete({
        deleteFn: roleApi.delete,
        onSuccess: ids => {
            setSelectedRowKeys(prev => prev.filter(key => !ids.includes(key as number)));
            refreshTableData();
        },
    });

    // 表单
    const [menuTreeData, setMenuTreeData] = useState<Menu[]>([]);
    const [checkedMenuKeys, setCheckedMenuKeys] = useState<Key[]>([]);
    const menuTreeNodes: DataNode[] = useMemo(() => {
        function convert(menus: Menu[]): DataNode[] {
            return menus
                .map(menu => ({
                    title: menu.title,
                    key: menu.id,
                    children: menu.children?.length ? convert(menu.children) : undefined,
                }));
        }

        return convert(menuTreeData);
    }, [menuTreeData]);

    const {
        modalOpen,
        confirmLoading,
        form: modalForm,
        openCreate,
        openEdit,
        close,
        submit,
    } = useCrudModal<RoleForm>({
        create: roleApi.create,
        update: roleApi.update,
        onSuccess: refreshTableData,
        transform: values => ({...values, menuIdSet: checkedMenuKeys as number[]}),
    });

    function requestMenuTree() {
        menuApi.findAll().then(menus => {
            setMenuTreeData(menus);
        }).catch(error => {
            void message.error('请求菜单数据失败: ' + error);
        });
    }

    useEffect(() => {
        requestMenuTree();
        requestTableData();
    }, []);

    function handleCreateOpen() {
        openCreate();
        setCheckedMenuKeys([]);
    }

    function handleEditOpen(role: Role) {
        const menuIds = Array.isArray(role.menuSet)
            ? role.menuSet.map(m => m.id)
            : [...(role.menuSet as Set<Menu>)].map(m => m.id);
        openEdit({
            ...role,
            menuIdSet: menuIds,
        });
        setCheckedMenuKeys(menuIds);
    }

    const columns = [
        {
            title: '角色名称',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: '角色标识',
            dataIndex: 'value',
            key: 'value',
        },
        ...auditColumns,
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, role: Role) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEditOpen(role)}>
                        编辑
                    </Button>
                    <Popconfirm title="确认删除该角色？" onConfirm={() => deleteByIds([role.id])}>
                        <Permission permission="system:role:delete">
                            <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                                    loading={deletingIds.includes(role.id)}>
                                删除
                            </Button>
                        </Permission>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Form form={searchForm} layout="inline" autoComplete="off">
                <Form.Item name="label" label="角色名称">
                    <Input allowClear/>
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
                    <Permission permission="system:role:create">
                        <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreateOpen}>
                            新增
                        </Button>
                    </Permission>
                    <Permission permission="system:role:delete">
                        <Popconfirm title={`确认删除选中的 ${selectedRowKeys.length} 个角色？`}
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
                forceRender
                open={modalOpen}
                onOk={submit}
                onCancel={close}
                confirmLoading={confirmLoading}
                destroyOnHidden
                title="角色信息"
            >
                <Form form={modalForm} layout="horizontal" labelAlign="left" labelCol={{span: 5}}
                      wrapperCol={{span: 17}}
                      style={{marginTop: 16}} autoComplete="off">
                    <Form.Item name="id" hidden>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="label" label="角色名称" rules={[{required: true, message: '请输入角色名称'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="value" label="角色标识" rules={[{required: true, message: '请输入角色标识'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label="菜单权限">
                        <Tree
                            checkStrictly
                            checkable
                            checkedKeys={checkedMenuKeys}
                            onCheck={(keys) => {
                                const checked = Array.isArray(keys) ? keys : keys.checked;
                                setCheckedMenuKeys(checked);
                            }}
                            treeData={menuTreeNodes}
                            defaultExpandAll
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoleManagement;
