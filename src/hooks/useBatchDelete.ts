import {useCallback, useState} from 'react';
import {message} from 'antd';

interface BatchDeleteOptions {
    deleteFn: (ids: number[]) => Promise<void>;
    onSuccess?: (ids: number[]) => void;
}

export function useBatchDelete({deleteFn, onSuccess}: BatchDeleteOptions) {
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    const deleteByIds = useCallback((ids: number[]) => {
        setDeletingIds(ids);
        deleteFn(ids)
            .then(() => {
                void message.success('删除成功');
                onSuccess?.(ids);
            })
            .catch(error => {
                void message.error('删除失败: ' + error);
            })
            .finally(() => {
                setDeletingIds([]);
            });
    }, [deleteFn, onSuccess]);

    return {deletingIds, deleteByIds};
}
