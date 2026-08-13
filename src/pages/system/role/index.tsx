import React, {useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Space, Table, Tree} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import type {DataNode} from 'antd/es/tree';
import roleApi, {type Role, type RoleForm, type RoleQueryParam} from '@/api/role';
import menuApi, {type Menu} from '@/api/menu';

const RoleManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Role[]>([]);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [searchForm] = Form.useForm<RoleQueryParam>();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfirmLoading, setModalConfirmLoading] = useState(false);
    const [modalForm] = Form.useForm<RoleForm>();
    const [menuTreeData, setMenuTreeData] = useState<Menu[]>([]);
    const [checkedMenuKeys, setCheckedMenuKeys] = useState<React.Key[]>([]);

    const menuTreeNodes: DataNode[] = useMemo(() => {
        function convert(menus: Menu[]): DataNode[] {
            return menus
                .map(menu => ({
                    title: menu.title,
                    key: String(menu.id),
                    children: menu.children?.length ? convert(menu.children) : undefined,
                }));
        }

        return convert(menuTreeData);
    }, [menuTreeData]);

    function requestMenuTree() {
        menuApi.findAll().then(menus => {
            setMenuTreeData(menus);
        }).catch(error => {
            void message.error('请求菜单数据失败: ' + error);
        });
    }

    function requestTableData(page = 1, pageSize = 10) {
        const searchValues = searchForm.getFieldsValue();
        const params: RoleQueryParam = {
            label: searchValues.label || null,
        };
        setLoading(true);
        roleApi.read(params, {page: page - 1, size: pageSize}, {
            property: 'createdDate',
            direction: 'desc',
        }).then(pagedData => {
            setData(pagedData.content);
            setPagination({
                current: pagedData.page.number + 1,
                pageSize: pagedData.page.size,
                total: pagedData.page.totalElements,
            });
        }).catch(error => {
            void message.error('请求角色数据失败: ' + error);
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
        requestMenuTree();
        requestTableData();
    }, []);

    function handleCreateOpen() {
        modalForm.resetFields();
        setCheckedMenuKeys([]);
        setModalOpen(true);
    }

    function handleEditOpen(role: Role) {
        const menuIds = Array.isArray(role.menuSet)
            ? role.menuSet.map(m => m.id)
            : [...(role.menuSet as Set<Menu>)].map(m => m.id);
        modalForm.setFieldsValue({
            id: role.id,
            label: role.label,
            value: role.value,
        });
        setCheckedMenuKeys(menuIds.map(id => String(id)));
        setModalOpen(true);
    }

    const handleModalSubmit = async () => {
        try {
            const values = await modalForm.validateFields();
            setModalConfirmLoading(true);
            const formData: RoleForm = {
                ...values,
                menuIdSet: checkedMenuKeys.map(key => Number(key)),
            };
            if (formData.id) {
                await roleApi.update(formData);
                void message.success('修改成功');
            } else {
                await roleApi.create(formData);
                void message.success('新增成功');
            }
            setModalOpen(false);
            refreshTableData();
        } catch {
            void message.error('表单提交失败');
        } finally {
            setModalConfirmLoading(false);
        }
    };

    function handleDelete(ids: number[]) {
        setDeletingIds(ids);
        roleApi.delete(ids).then(() => {
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
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, role: Role) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEditOpen(role)}>
                        编辑
                    </Button>
                    <Popconfirm title="确认删除该角色？" onConfirm={() => handleDelete([role.id])}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                                loading={deletingIds.includes(role.id)}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Form form={searchForm} layout="inline" style={{marginBottom: 16}}>
                <Form.Item name="label" label="角色名称">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined/>} onClick={refreshTableData}>
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
                    <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreateOpen}>
                        新增
                    </Button>
                    <Popconfirm title={`确认删除选中的 ${selectedRowKeys.length} 个角色？`}
                                onConfirm={() => handleDelete(selectedRowKeys as number[])}
                                disabled={selectedRowKeys.length === 0}>
                        <Button danger icon={<DeleteOutlined/>} disabled={selectedRowKeys.length === 0}>
                            批量删除
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            <div style={{border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden'}}>
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
                onOk={handleModalSubmit}
                onCancel={() => setModalOpen(false)}
                confirmLoading={modalConfirmLoading}
                destroyOnHidden
                title="角色信息"
            >
                <Form form={modalForm} layout="horizontal" labelAlign="left" labelCol={{span: 5}}
                      wrapperCol={{span: 17}}
                      style={{marginTop: 16}}>
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
                                const ck = Array.isArray(keys) ? keys : keys.checked;
                                setCheckedMenuKeys(ck);
                            }}
                            treeData={menuTreeNodes}
                            defaultExpandAll
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RoleManagement;
