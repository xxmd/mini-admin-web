import type {FormInstance} from 'antd';
import type {Pageable, PagedModel, Sort} from '@/api/common';
import {usePagedTable} from '@/hooks/usePagedTable';
import {useCrudModal} from '@/hooks/useCrudModal';
import {useBatchDelete} from '@/hooks/useBatchDelete';

interface CrudApi<T, F, S> {
    read: (search: S, pageable: Pageable, sorts?: Sort[]) => Promise<PagedModel<T>>;
    create: (data: F) => Promise<void>;
    update: (data: F) => Promise<void>;
    delete: (ids: number[]) => Promise<void>;
}

interface CrudPageOptions<T, F extends {id?: number}, S> {
    api: CrudApi<T, F, S>;
    searchForm: FormInstance<S>;
    transform?: (values: F) => F;
}

export function useCrudPage<T, F extends {id?: number}, S>({api, searchForm, transform}: CrudPageOptions<T, F, S>) {
    const table = usePagedTable({read: api.read, searchForm});

    const modal = useCrudModal({
        create: api.create,
        update: api.update,
        transform,
        onSuccess: table.refreshTableData,
    });

    const batchDelete = useBatchDelete({
        deleteFn: api.delete,
        onSuccess: ids => {
            table.setSelectedRowKeys(prev => prev.filter(key => !ids.includes(key as number)));
            table.refreshTableData();
        },
    });

    return {
        ...table,
        ...modal,
        ...batchDelete,
    };
}
