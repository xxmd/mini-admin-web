import React, {useCallback, useEffect, useState} from 'react';
import {Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Radio, Space, Table, TreeSelect, message} from 'antd';
import {PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, MinusOutlined} from '@ant-design/icons';
import menuApi, {type Menu, type MenuForm} from '@/api/menu'
import enumApi, {type EnumOption} from '@/api/enum'

const buildTree = (flatList: Menu[]): Menu[] => {
    const map = new Map<number, Menu>();
    const roots: Menu[] = [];
    flatList.forEach(item => {
        map.set(item.id, {...item});
    });
    map.forEach(item => {
        if (item.parentId === null) {
            roots.push(item);
        } else {
            const parent = map.get(item.parentId);
            if (parent) {
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(item);
            }
        }
    });
    roots.forEach(root => {
        root.children?.sort((a, b) => a.sort - b.sort);
    });
    console.log( roots)
    return roots;
};

const MenuManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Menu[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm<MenuForm>();
    const [typeOptions, setTypeOptions] = useState<EnumOption[]>([]);
    const [parentFixed, setParentFixed] = useState(false);
    const [editingId, setEditingId] = useState<number | undefined>(undefined);

    const menuType = Form.useWatch('type', form);

    const typeLabelMap = useCallback(
        (value: string) => typeOptions.find(opt => opt.value === value)?.label ?? value,
        [typeOptions],
    );

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await menuApi.findAll();
            setData(buildTree(res));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        enumApi.get('MenuType').then(setTypeOptions);
    }, [fetchData]);

    const toTreeSelectData = (nodes: Menu[]): {title: string; value: number; disabled?: boolean; children?: any[]}[] =>
        nodes.map(node => ({
            title: node.title,
            value: node.id,
            disabled: node.id === editingId ? true : undefined,
            children: node.children?.length ? toTreeSelectData(node.children) : undefined,
        }));

    const handleAdd = () => {
        form.resetFields();
        form.setFieldsValue({type: 'CATEGORY'});
        setParentFixed(false);
        setEditingId(undefined);
        setModalOpen(true);
    };

    const handleEdit = (record: Menu) => {
        form.resetFields();
        form.setFieldsValue({
            id: record.id,
            parentId: record.parentId,
            type: record.type,
            title: record.title,
            path: record.path,
            component: record.component,
            permission: record.permission,
            sort: record.sort,
            hidden: record.hidden,
        });
        setParentFixed(false);
        setEditingId(record.id);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await menuApi.delete([id]);
            message.success('删除成功');
            fetchData();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);
            if (values.id) {
                await menuApi.update(values);
                message.success('修改成功');
            } else {
                await menuApi.create(values);
                message.success('新增成功');
            }
            setModalOpen(false);
            fetchData();
        } catch (error) {
            // validateFields rejected or api error
        } finally {
            setConfirmLoading(false);
        }
    };

    const columns = [
        {
            title: '菜单标题',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => typeLabelMap(type),
        },
        {
            title: '路由路径',
            dataIndex: 'path',
            key: 'path',
        },
        {
            title: '组件路径',
            dataIndex: 'component',
            key: 'component',
        },
        {
            title: '权限标识',
            dataIndex: 'permission',
            key: 'permission',
        },
        {
            title: '排序',
            dataIndex: 'sort',
            key: 'sort',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: Menu) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm title="确认删除该菜单？" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{padding: 24}}>
            <Card
                title="菜单管理"
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined/>} onClick={fetchData}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={() => handleAdd()}>
                            新增
                        </Button>
                    </Space>
                }
            >
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    defaultExpandAllRows
                />
            </Card>

            <Modal
                title="菜单配置"
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                confirmLoading={confirmLoading}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" style={{marginTop: 16}}>
                    <Form.Item name="id" hidden>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="parentId" label="上层目录">
                        <TreeSelect
                            treeData={toTreeSelectData(data)}
                            disabled={parentFixed}
                            allowClear
                            placeholder=""
                            treeDefaultExpandAll
                        />
                    </Form.Item>
                    <Form.Item name="type" label="菜单类型" rules={[{required: true}]}>
                        <Radio.Group>
                            {typeOptions.map(opt => (
                                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="title" label="菜单标题" rules={[{required: true, message: '请输入菜单标题'}]}>
                        <Input placeholder="请输入菜单标题"/>
                    </Form.Item>
                    {(menuType === 'CATEGORY' || menuType === 'MENU') && (
                        <Form.Item name="path" label="路由路径" rules={[{required: true, message: '请输入路由路径'}]}>
                            <Input placeholder="例如: /system/menu"/>
                        </Form.Item>
                    )}
                    {menuType === 'MENU' && (
                        <>
                            <Form.Item name="component" label="组件路径">
                                <Input placeholder="例如: system/MenuManagement"/>
                            </Form.Item>
                            <Form.Item name="permission" label="权限标识">
                                <Input placeholder="例如: system:menu:list"/>
                            </Form.Item>
                        </>
                    )}
                    {menuType === 'BUTTON' && (
                        <Form.Item name="permission" label="权限标识" rules={[{required: true, message: '请输入权限标识'}]}>
                            <Input placeholder="例如: system:menu:add"/>
                        </Form.Item>
                    )}
                    <Form.Item name="sort" label="排序" initialValue={99}>
                        <InputNumber mode="spinner" min={1} style={{width: '100%'}}/>
                    </Form.Item>
                    <Form.Item name="hidden" label="是否隐藏" initialValue={false}>
                        <Radio.Group>
                            <Radio value={false}>否</Radio>
                            <Radio value={true}>是</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuManagement;
