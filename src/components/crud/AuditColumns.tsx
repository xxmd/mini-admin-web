export const auditColumns = [
    {
        title: '创建时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        sorter: true,
        render: (val: Date) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
        title: '创建者',
        dataIndex: 'createdBy',
        key: 'createdBy',
        render: (val: string) => val || '-',
    },
    {
        title: '修改时间',
        dataIndex: 'modifiedDate',
        key: 'modifiedDate',
        sorter: true,
        render: (val: Date) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
        title: '修改者',
        dataIndex: 'modifiedBy',
        key: 'modifiedBy',
        render: (val: string) => val || '-',
    },
];
