import {type FC, type Key, useCallback, useEffect, useMemo, useState} from 'react';
import {Form, Input, message, Table, Tree} from 'antd';
import type {DataNode} from 'antd/es/tree';
import roleApi, {type Role, type RoleForm, type RoleSearchForm} from '@/api/system/role';
import menuApi, {type Menu} from '@/api/system/menu';
import type {Pageable, Sort} from '@/api/common';
import {SearchForm} from '@/components/crud/SearchForm';
import {Toolbar} from '@/components/crud/Toolbar';
import {CrudModal} from '@/components/crud/CrudModal';
import {CrudLayout} from '@/components/crud/CrudLayout';
import {createActionColumn} from '@/components/crud/ActionColumn';
import {useCrudPage} from '@/hooks/useCrudPage';
import {auditColumns} from '@/components/crud/AuditColumns';

const RoleManagement: FC = () => {
    // 搜索
    const [searchForm] = Form.useForm<RoleSearchForm>();

    // 表格
    const read = useCallback((search: RoleSearchForm, pageable: Pageable, sorts?: Sort[]) =>
        roleApi.read({label: search.label ?? null}, pageable, sorts), []);

    // 表单（菜单树）
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
        form: modalForm,
        openCreate,
        openEdit,
        close,
        submit,
    } = useCrudPage<Role, RoleForm, RoleSearchForm>({
        read,
        create: roleApi.create,
        update: roleApi.update,
        deleteFn: roleApi.delete,
        searchForm,
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
        createActionColumn<Role>({
            entityName: '角色',
            deletePermission: 'system:role:delete',
            onEdit: handleEditOpen,
            onDelete: id => deleteByIds([id]),
            deletingIds,
        }),
    ];

    return (
        <CrudLayout>
            <SearchForm form={searchForm} onSearch={refreshTableData} onReset={reset}>
                <Form.Item name="label" label="角色名称">
                    <Input allowClear/>
                </Form.Item>
            </SearchForm>

            <Toolbar
                createPermission="system:role:create"
                deletePermission="system:role:delete"
                onCreate={handleCreateOpen}
                onRefresh={refreshTableData}
                entityName="角色"
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

            <CrudModal
                open={modalOpen}
                confirmLoading={confirmLoading}
                onOk={submit}
                onCancel={close}
                form={modalForm}
                title="角色信息"
                forceRender
                labelCol={5}
                wrapperCol={17}
            >
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
            </CrudModal>
        </CrudLayout>
    );
};

export default RoleManagement;
