import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { useCustomers } from '../hooks/useCustomers';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export const Customers: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useCustomers({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'companyName', header: 'Company Name' },
    { accessorKey: 'contactName', header: 'Contact Name' },
    { accessorKey: 'contactTitle', header: 'Title' },
    { accessorKey: 'country', header: 'Country' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Customers</h1>
        <p style={{ color: 'var(--color-muted)' }}>View and manage customer details.</p>
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
