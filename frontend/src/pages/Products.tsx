import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useProducts, useCreateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useAuth } from '../auth/useAuth';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export const Products: React.FC = () => {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading } = useProducts({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    name: debouncedSearch || undefined,
  });
  
  const createMutation = useCreateProduct();
  const deleteMutation = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'productName', header: 'Product Name' },
    { accessorKey: 'unitPrice', header: 'Price', cell: (info) => `$${info.getValue()?.toFixed(2) || '0.00'}` },
    { accessorKey: 'unitsInStock', header: 'Stock' },
    { 
      accessorKey: 'discontinued', 
      header: 'Status',
      cell: (info) => info.getValue() ? <Badge variant="danger">Discontinued</Badge> : <Badge variant="success">Active</Badge>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => hasRole(['ADMIN', 'MANAGER']) ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" style={{ padding: '0.25rem 0.5rem' }}>Edit</Button>
          {hasRole(['ADMIN']) && (
            <Button variant="danger" size="sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(row.original.id)}>Delete</Button>
          )}
        </div>
      ) : null
    }
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified form data handling
    const formData = new FormData(e.target as HTMLFormElement);
    const newProduct = {
      productName: formData.get('productName') as string,
      unitPrice: Number(formData.get('unitPrice')),
      unitsInStock: Number(formData.get('unitsInStock')),
      reorderLevel: Number(formData.get('reorderLevel')),
    };
    createMutation.mutate(newProduct, {
      onSuccess: () => setIsAddModalOpen(false),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Products</h1>
          <p style={{ color: 'var(--color-muted)' }}>Manage product inventory.</p>
        </div>
        {hasRole(['ADMIN', 'MANAGER']) && (
          <Button onClick={() => setIsAddModalOpen(true)}>Add Product</Button>
        )}
      </div>

      <Card>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Input 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        <DataTable 
          columns={columns} 
          data={data?.content || []} 
          pageCount={data?.totalPages || -1}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
        />
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Product">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <Input id="productName" name="productName" required />
          </div>
          <div className="form-group">
            <label htmlFor="unitPrice">Unit Price ($)</label>
            <Input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required />
          </div>
          <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="unitsInStock">Initial Stock</label>
              <Input id="unitsInStock" name="unitsInStock" type="number" min="0" required />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="reorderLevel">Reorder Level</label>
              <Input id="reorderLevel" name="reorderLevel" type="number" min="0" required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
