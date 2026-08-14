import {useCallback, useEffect, useState, type Key} from 'react';
import type {FormInstance} from 'antd';
import type {SorterResult, TablePaginationConfig} from 'antd/es/table/interface';
import type {Pageable, PagedModel, Sort} from '@/api/common';

interface PagedTableOptions<T, S> {
    read: (search: S, pageable: Pageable, sorts?: Sort[]) => Promise<PagedModel<T>>;
    searchForm: FormInstance<S>;
}

const DEFAULT_SORT: Sort[] = [{property: 'createdDate', direction: 'desc'}];

export function usePagedTable<T, S>({read, searchForm}: PagedTableOptions<T, S>) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<T[]>([]);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [sorts, setSorts] = useState<Sort[]>(DEFAULT_SORT);

    const requestTableData = useCallback((page = 1, pageSize = 10, currentSorts?: Sort[]) => {
        read(searchForm.getFieldsValue(), {page, size: pageSize}, currentSorts ?? sorts)
            .then(pagedData => {
                setData(pagedData.content);
                setPagination({
                    current: pagedData.page.number + 1,
                    pageSize: pagedData.page.size,
                    total: pagedData.page.totalElements,
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [read, searchForm, sorts]);

    useEffect(() => {
        requestTableData();
    }, []);

    const refreshTableData = useCallback(() => {
        setLoading(true);
        requestTableData(1, pagination.pageSize);
    }, [requestTableData, pagination.pageSize]);

    const reset = useCallback(() => {
        searchForm.resetFields();
        refreshTableData();
    }, [searchForm, refreshTableData]);

    const handleTableChange = useCallback((
        _pagination: TablePaginationConfig,
        _filters: Record<string, unknown>,
        sorter: SorterResult<T> | SorterResult<T>[],
    ) => {
        const sorterList = Array.isArray(sorter) ? sorter : [sorter];
        const newSorts: Sort[] = sorterList
            .filter(s => s.order)
            .map(s => ({
                property: (s.columnKey as string) || (s.field as string),
                direction: s.order === 'ascend' ? 'asc' : 'desc',
            }));
        if (newSorts.length === 0) {
            newSorts.push({property: 'createdDate', direction: 'desc'});
        }
        setSorts(newSorts);
        setLoading(true);
        requestTableData(_pagination.current ?? 1, _pagination.pageSize ?? 10, newSorts);
    }, [requestTableData]);

    return {
        loading,
        data,
        pagination,
        selectedRowKeys,
        sorts,
        setSelectedRowKeys,
        requestTableData,
        refreshTableData,
        reset,
        handleTableChange,
    };
}
