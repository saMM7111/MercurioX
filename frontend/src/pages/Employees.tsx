import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { useEmployees } from '../hooks/useEmployees';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export const Employees: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useEmployees({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'country', header: 'Country' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Employees</h1>
        <p style={{ color: 'var(--color-muted)' }}>Manage employee records. Restricted to Admin and Manager roles.</p>
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
