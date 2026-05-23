import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { useOrders } from '../hooks/useOrders';
import { Badge } from '../components/ui/Badge';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export const Orders: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'Order ID' },
    { accessorKey: 'customerId', header: 'Customer ID' },
    { accessorKey: 'orderDate', header: 'Order Date', cell: (info) => new Date(info.getValue()).toLocaleDateString() },
    { accessorKey: 'totalAmount', header: 'Total', cell: (info) => `$${info.getValue()?.toFixed(2) || '0.00'}` },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info) => {
        const val = info.getValue() || 'Pending';
        if (val === 'Delivered') return <Badge variant="success">Delivered</Badge>;
        if (val === 'Shipped') return <Badge variant="warning">Shipped</Badge>;
        return <Badge variant="neutral">Pending</Badge>;
      }
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Orders</h1>
        <p style={{ color: 'var(--color-muted)' }}>Manage and track customer orders.</p>
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
