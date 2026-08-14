import type {FormInstance} from 'antd';
import type {Pageable, PagedModel, Sort} from '@/api/common';
import {usePagedTable} from '@/hooks/usePagedTable';
import {useCrudModal} from '@/hooks/useCrudModal';
import {useBatchDelete} from '@/hooks/useBatchDelete';

interface CrudPageOptions<T, F extends {id?: number}, S> {
    read: (search: S, pageable: Pageable, sorts?: Sort[]) => Promise<PagedModel<T>>;
    create: (data: F) => Promise<void>;
    update: (data: F) => Promise<void>;
    deleteFn: (ids: number[]) => Promise<void>;
    searchForm: FormInstance<S>;
    transform?: (values: F) => F;
}

export function useCrudPage<T, F extends {id?: number}, S>(options: CrudPageOptions<T, F, S>) {
    const {read, create, update, deleteFn, searchForm, transform} = options;

    const table = usePagedTable({read, searchForm});

    const modal = useCrudModal({
        create,
        update,
        transform,
        onSuccess: table.refreshTableData,
    });

    const batchDelete = useBatchDelete({
        deleteFn,
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
