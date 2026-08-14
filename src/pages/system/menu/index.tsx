import {type FC, useCallback, useEffect, useMemo, useState} from 'react';
import {Form, Input, InputNumber, message, Radio, Table, TreeSelect} from 'antd';
import menuApi, {type Menu, type MenuForm, MenuType} from '@/api/system/menu'
import enumApi, {EnumName, type EnumOption} from '@/api/enum'
import {Toolbar} from '@/components/crud/Toolbar';
import {CrudModal} from '@/components/crud/CrudModal';
import {CrudLayout} from '@/components/crud/CrudLayout';
import {createActionColumn} from '@/components/crud/ActionColumn';
import {useCrudModal} from '@/hooks/useCrudModal';
import {useBatchDelete} from '@/hooks/useBatchDelete';

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

const MenuManagement: FC = () => {
    // 表格
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Menu[]>([]);

    // 表单
    const [editingId, setEditingId] = useState<number | undefined>(undefined);

    // 通用
    const [menuTypeOptions, setMenuTypeOptions] = useState<EnumOption[]>([]);

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

    // 删除
    const {deletingIds, deleteByIds} = useBatchDelete({
        deleteFn: menuApi.delete,
        onSuccess: refreshTableData,
    });

    // 表单弹窗
    const {
        modalOpen,
        confirmLoading,
        form,
        openCreate,
        openEdit,
        close,
        submit,
    } = useCrudModal<MenuForm>({
        create: menuApi.create,
        update: menuApi.update,
        onSuccess: refreshTableData,
    });

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
        openCreate({type: MenuType.CATEGORY});
        setEditingId(undefined);
    }

    function handleEdit(menu: Menu) {
        openEdit({
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
    }

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
        createActionColumn<Menu>({
            entityName: '菜单',
            updatePermission: 'system:menu:update',
            deletePermission: 'system:menu:delete',
            onEdit: handleEdit,
            onDelete: id => deleteByIds([id]),
            deletingIds,
        }),
    ];

    return (
        <CrudLayout>
            <Toolbar
                createPermission="system:menu:create"
                onCreate={handleCreate}
                onRefresh={refreshTableData}
                entityName="菜单"
            />

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={false}
            />

            <CrudModal open={modalOpen} confirmLoading={confirmLoading} onOk={submit} onCancel={close} form={form}>
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
            </CrudModal>
        </CrudLayout>
    );
};

export default MenuManagement;
