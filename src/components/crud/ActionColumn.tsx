import {Button, Popconfirm, Space} from 'antd';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {Permission} from '@/components/auth/Permission';

interface ActionColumnOptions<T extends {id: number}> {
    entityName: string;
    updatePermission?: string;
    deletePermission: string;
    onEdit: (record: T) => void;
    onDelete: (id: number) => void;
    deletingIds?: number[];
}

export function createActionColumn<T extends {id: number}>(options: ActionColumnOptions<T>) {
    const {entityName, updatePermission, deletePermission, onEdit, onDelete, deletingIds = []} = options;

    return {
        title: '操作',
        key: 'action',
        render: (_: unknown, record: T) => {
            const editButton = (
                <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => onEdit(record)}>
                    编辑
                </Button>
            );
            return (
                <Space>
                    {updatePermission
                        ? <Permission permission={updatePermission}>{editButton}</Permission>
                        : editButton}
                    <Permission permission={deletePermission}>
                        <Popconfirm title={`确认删除该${entityName}？`} onConfirm={() => onDelete(record.id)}>
                            <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                                    loading={deletingIds.includes(record.id)}>
                                删除
                            </Button>
                        </Popconfirm>
                    </Permission>
                </Space>
            );
        },
    };
}
