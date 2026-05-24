import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { Badge } from '../components/ui/Badge';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

interface AuditLog {
    id: string;
    createdAt: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string;
}

export const AuditLogs: React.FC = () => {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading } = useAuditLogs({
        page: pagination.pageIndex,
        size: pagination.pageSize,
    });

    const columns: ColumnDef<AuditLog, string>[] = [
        { accessorKey: 'id', header: 'Log ID' },
        {
            accessorKey: 'createdAt',
            header: 'Timestamp',
            cell: (info) => new Date(info.getValue()).toLocaleString(),
        },
        { accessorKey: 'userId', header: 'User ID' },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: (info) => {
                const action = info.getValue();
                if (action === 'CREATE') return <Badge variant="success">{action}</Badge>;
                if (action === 'UPDATE') return <Badge variant="warning">{action}</Badge>;
                if (action === 'DELETE') return <Badge variant="danger">{action}</Badge>;
                return <Badge>{action}</Badge>;
            },
        },
        { accessorKey: 'entityType', header: 'Entity' },
        { accessorKey: 'entityId', header: 'Entity ID' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Audit Logs</h1>
                <p style={{ color: 'var(--color-muted)' }}>System-wide audit trail of data modifications. Restricted to Admins.</p>
            </div>

            <Card>
                <DataTable
                    columns={columns}
                    data={data?.content || []}
                    pageCount={data?.totalPages || -1}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    isLoading={isLoading}
                />
            </Card>
        </div>
    );
};