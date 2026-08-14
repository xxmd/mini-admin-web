import request from '@/utils/request';
import type {Pageable, PagedModel, Sort} from "@/api/common.ts";

interface CrudForm {
    id?: number;
}

export function createCrudApi<
    T,
    F extends CrudForm,
    S
>(basePath: string) {
    return {
        create(data: F): Promise<void> {
            return request.post(`${basePath}/create`, data);
        },
        read(data: S, pageable: Pageable, sorts?: Sort[]): Promise<PagedModel<T>> {
            return request.post(`${basePath}/read`, data, {
                params: {
                    page: pageable.page - 1,
                    size: pageable.size,
                    ...(sorts && sorts.length > 0 ? {sort: sorts.map(s => `${s.property},${s.direction}`)} : {}),
                },
                paramsSerializer: {indexes: null},
            });
        },
        update(data: F): Promise<void> {
            return request.post(`${basePath}/update`, data);
        },
        delete(ids: number[]): Promise<void> {
            return request.post(`${basePath}/delete`, ids);
        },
    };
}
