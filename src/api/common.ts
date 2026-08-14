export interface BaseEntity {
    id: number;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}

export interface Pageable {
    page: number;
    size: number;
}

export interface Sort {
    property: string;
    direction: 'asc' | 'desc';
}

export interface PagedModel<T> {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}
