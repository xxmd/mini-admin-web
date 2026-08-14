import {Button, Popconfirm, Space} from 'antd';
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from '@ant-design/icons';
import {Permission} from '@/components/auth/Permission';

interface ToolbarProps {
    createPermission: string;
    deletePermission?: string;
    onCreate: () => void;
    onRefresh: () => void;
    entityName: string;
    selectedCount?: number;
    onBatchDelete?: () => void;
}

export function Toolbar({createPermission, deletePermission, onCreate, onRefresh, entityName, selectedCount = 0, onBatchDelete}: ToolbarProps) {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Space>
                <Permission permission={createPermission}>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={onCreate}>
                        新增
                    </Button>
                </Permission>
                {onBatchDelete && deletePermission && (
                    <Permission permission={deletePermission}>
                        <Popconfirm
                            title={`确认删除选中的 ${selectedCount} 个${entityName}？`}
                            onConfirm={onBatchDelete}
                            disabled={selectedCount === 0}
                        >
                            <Button danger icon={<DeleteOutlined/>} disabled={selectedCount === 0}>
                                删除
                            </Button>
                        </Popconfirm>
                    </Permission>
                )}
            </Space>
            <Button icon={<ReloadOutlined/>} onClick={onRefresh}/>
        </div>
    );
}
