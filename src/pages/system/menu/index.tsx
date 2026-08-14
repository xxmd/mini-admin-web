import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, InputNumber, message, Modal, Popconfirm, Radio, Space, Table, TreeSelect} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from '@ant-design/icons';
import menuApi, {type Menu, type MenuForm, MenuType} from '@/api/menu'
import enumApi, {EnumName, type EnumOption} from '@/api/enum'
import {Permission} from '@/components/Permission';

interface MenuOption {
    label: string;
    value: number;
    disabled: boolean;
    children?: MenuOption[];
}

function convertToOptions(menus: Iterable<Menu>, editingId: number | undefined): MenuOption[] {
    const options: MenuOption[] = [];
    for (const menu of menus) {
        if (menu.type === MenuType.BUTTON) continue;
        const isEditingOrDescendant = menu.id === editingId;
        options.push({
            label: menu.title,
            value: menu.id,
            disabled: isEditingOrDescendant,
            children: menu.hasChildren ? convertToOptions(menu.children!, editingId) : undefined,
        });
    }
    return options;
}

const MenuManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Menu[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm<MenuForm>();
    const [menuTypeOptions, setMenuTypeOptions] = useState<EnumOption[]>([]);
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    function requestTableData() {
        menuApi.findAll().then(menus => {
            setData(menus);
        }).catch(error => {
            void message.error('请求菜单数据失败: ' + error);
        }).finally(() => {
            setLoading(false);
        });
    }

    function refreshTableData() {
        setLoading(true);
        requestTableData();
    }

    function requestMenuTypeOptions() {
        enumApi.get(EnumName.MenuType).then(menuTypeOptions => {
            setMenuTypeOptions(menuTypeOptions);
        }).catch(error => {
            void message.error('请求菜单类型数据失败: ' + error);
        });
    }

    useEffect(() => {
        requestTableData();
        requestMenuTypeOptions();
    }, []);

    const treeMenuOptions = useMemo(() => {
        return convertToOptions(data, editingId);
    }, [data, editingId]);

    const menuType: MenuType = Form.useWatch<MenuType>('type', form);
    const requireInputPath = menuType === MenuType.CATEGORY || menuType === MenuType.MENU;
    const requireInputComponent = menuType === MenuType.MENU;
    const requireInputPermission = menuType === MenuType.MENU || menuType === MenuType.BUTTON;

    const typeLabelMap = useCallback(
        (value: string) => menuTypeOptions.find(opt => opt.value === value)?.label ?? value,
        [menuTypeOptions],
    );

    function handleCreate() {
        form.resetFields();
        form.setFieldsValue({type: MenuType.CATEGORY});
        setEditingId(undefined);
        setModalOpen(true);
    }

    function handleEdit(menu: Menu) {
        form.resetFields();
        form.setFieldsValue({
            id: menu.id,
            parentId: menu.parentId,
            type: menu.type,
            title: menu.title,
            path: menu.path,
            component: menu.component,
            permission: menu.permission,
            sort: menu.sort,
            hidden: menu.hidden,
        });
        setEditingId(menu.id);
        setModalOpen(true);
    }

    function handleDelete(ids: number[]) {
        setDeletingIds(ids);
        menuApi.delete(ids).then(() => {
            void message.success('删除成功');
            refreshTableData();
        }).catch(error => {
            void message.error('删除失败: ' + error);
        }).finally(() => {
            setDeletingIds([]);
        })
    }

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
            refreshTableData();
        } catch (error) {
            void message.error('表单提交失败: ' + error);
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
            title: '菜单类型',
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
            render: (_: unknown, menu: Menu) => (
                <Space>
                    <Permission permission="system:menu:update">
                        <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEdit(menu)}>
                            编辑
                        </Button>
                    </Permission>
                    <Popconfirm title="确认删除该菜单？" onConfirm={() => handleDelete([menu.id])}>
                        <Permission permission="system:menu:delete">
                            <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                                    loading={deletingIds.includes(menu.id)}>
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Permission permission="system:menu:create">
                    <Button type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
                        新增
                    </Button>
                </Permission>
                <Button icon={<ReloadOutlined/>} onClick={refreshTableData}/>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={false}
            />

            <Modal
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                confirmLoading={confirmLoading}
                destroyOnHidden
            >
                <Form form={form} layout="horizontal" labelAlign="left" labelCol={{span: 4}} wrapperCol={{span: 18}}
                      style={{marginTop: 16}} autoComplete="off">
                    <Form.Item name="id" hidden>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="parentId" label="上层目录">
                        <TreeSelect
                            treeData={treeMenuOptions}
                            allowClear
                            placeholder=""
                            treeDefaultExpandAll
                        />
                    </Form.Item>
                    <Form.Item name="type" label="菜单类型" rules={[{required: true}]}>
                        <Radio.Group>
                            {menuTypeOptions.map(opt => (
                                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="title" label="菜单标题" rules={[{required: true, message: '请输入菜单标题'}]}>
                        <Input/>
                    </Form.Item>
                    {requireInputPath && (
                        <Form.Item name="path" label="路由路径" rules={[{required: true, message: '请输入路由路径'}]}>
                            <Input/>
                        </Form.Item>
                    )}
                    {requireInputComponent && (
                        <Form.Item name="component" label="组件路径"
                                   rules={[{required: true, message: '请输入组件路径'}]}>
                            <Input/>
                        </Form.Item>
                    )}
                    {requireInputPermission && (
                        <Form.Item name="permission" label="权限标识"
                                   rules={[{required: true, message: '请输入权限标识'}]}>
                            <Input/>
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
