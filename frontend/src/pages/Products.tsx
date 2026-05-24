import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import { useAuth } from '../auth/useAuth';
import type { Product } from '../api/endpoints/products';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export const Products: React.FC = () => {
    const { hasRole } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        search: debouncedSearch || undefined,
    });

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const handleDelete = (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(productId);
        }
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingProduct) return;
        const formData = new FormData(e.currentTarget);
        const updated: Partial<Product> = {
            productName: formData.get('productName') as string,
            unitPrice: Number(formData.get('unitPrice')),
            unitsInStock: Number(formData.get('unitsInStock')),
            reorderLevel: Number(formData.get('reorderLevel')),
            discontinued: editingProduct.discontinued,
        };
        updateMutation.mutate(
            { id: editingProduct.productId, product: updated },
            { onSuccess: () => setEditingProduct(null) }
        );
    };

    const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newProduct: Partial<Product> = {
            productName: formData.get('productName') as string,
            unitPrice: Number(formData.get('unitPrice')),
            unitsInStock: Number(formData.get('unitsInStock')),
            reorderLevel: Number(formData.get('reorderLevel')),
            discontinued: false,
        };
        createMutation.mutate(newProduct, {
            onSuccess: () => setIsAddModalOpen(false),
        });
    };

    const columns: ColumnDef<Product, unknown>[] = [
        { accessorKey: 'productId', header: 'ID' },
        { accessorKey: 'productName', header: 'Product Name' },
        {
            accessorKey: 'unitPrice',
            header: 'Price',
            cell: (info) => {
                const val = info.getValue() as number;
                return `$${val != null ? val.toFixed(2) : '0.00'}`;
            },
        },
        { accessorKey: 'unitsInStock', header: 'Stock' },
        {
            accessorKey: 'discontinued',
            header: 'Status',
            cell: (info) => (info.getValue() as boolean)
                ? <Badge variant="danger">Discontinued</Badge>
                : <Badge variant="success">Active</Badge>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => hasRole(['ADMIN', 'MANAGER']) ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => setEditingProduct(row.original)}
                    >
                        Edit
                    </Button>
                    {hasRole(['ADMIN']) && (
                        <Button
                            variant="danger"
                            size="sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            onClick={() => handleDelete(row.original.productId)}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            ) : null,
        },
    ];

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
                    data={data?.content ?? []}
                    pageCount={data?.totalPages ?? -1}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    isLoading={isLoading}
                />
            </Card>

            {/* Add Product Modal */}
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

            {/* Edit Product Modal */}
            <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
                {editingProduct && (
                    <form onSubmit={handleEditSubmit}>
                        <div className="form-group">
                            <label htmlFor="edit-productName">Product Name</label>
                            <Input id="edit-productName" name="productName" defaultValue={editingProduct.productName} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-unitPrice">Unit Price ($)</label>
                            <Input id="edit-unitPrice" name="unitPrice" type="number" step="0.01" min="0" defaultValue={editingProduct.unitPrice} required />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="edit-unitsInStock">Stock</label>
                                <Input id="edit-unitsInStock" name="unitsInStock" type="number" min="0" defaultValue={editingProduct.unitsInStock} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="edit-reorderLevel">Reorder Level</label>
                                <Input id="edit-reorderLevel" name="reorderLevel" type="number" min="0" defaultValue={editingProduct.reorderLevel} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
                            <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};