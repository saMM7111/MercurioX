import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useOrders, useCreateOrder, useOrderById } from '../hooks/useOrders';
import { useAllCustomers } from '../hooks/useCustomers';
import { useAuth } from '../auth/useAuth';
import type { Order, CreateOrderRequest } from '../api/endpoints/orders';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

const calculateTotal = (order: Order): number => {
    if (!order.details?.length) return 0;
    return order.details.reduce((sum, d) => {
        return sum + d.unitPrice * d.quantity * (1 - (d.discount ?? 0));
    }, 0);
};

// Sub-component so useOrderById hook is only called when an ID is selected
const OrderDetailModal: React.FC<{ orderId: number; onClose: () => void }> = ({ orderId, onClose }) => {
    const { data: order, isLoading } = useOrderById(orderId);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Order #${orderId}`}>
            {isLoading && <p style={{ color: 'var(--color-muted)' }}>Loading...</p>}
            {order && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div><span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Customer</span><p style={{ margin: 0 }}>{order.customerId}</p></div>
                        <div><span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Order Date</span><p style={{ margin: 0 }}>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}</p></div>
                        <div><span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Ship Name</span><p style={{ margin: 0 }}>{order.shipName || '—'}</p></div>
                        <div><span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Ship City</span><p style={{ margin: 0 }}>{order.shipCity || '—'}</p></div>
                        <div><span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Ship Country</span><p style={{ margin: 0 }}>{order.shipCountry || '—'}</p></div>
                        <div><span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>Status</span><p style={{ margin: 0 }}>{order.shippedDate ? <Badge variant="success">Shipped</Badge> : <Badge variant="neutral">Pending</Badge>}</p></div>
                    </div>

                    <hr style={{ borderColor: 'var(--color-border)', marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Order Items</p>

                    {order.details?.length ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                                <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem' }}>Product ID</th>
                                <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>Discount</th>
                                <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {order.details.map((d) => {
                                const subtotal = d.unitPrice * d.quantity * (1 - (d.discount ?? 0));
                                return (
                                    <tr key={d.productId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '0.4rem 0.5rem' }}>{d.productId}</td>
                                        <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>${d.unitPrice.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>{d.quantity}</td>
                                        <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>{((d.discount ?? 0) * 100).toFixed(0)}%</td>
                                        <td style={{ textAlign: 'right', padding: '0.4rem 0.5rem' }}>${subtotal.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'right', padding: '0.6rem 0.5rem', fontWeight: 600 }}>Total</td>
                                <td style={{ textAlign: 'right', padding: '0.6rem 0.5rem', fontWeight: 600 }}>${calculateTotal(order).toFixed(2)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--color-muted)' }}>No items found.</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export const Orders: React.FC = () => {
    const { hasRole } = useAuth();
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data, isLoading } = useOrders({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        customerId: debouncedSearch || undefined,
    });

    const { data: customersData } = useAllCustomers();
    const customers = customersData?.content ?? [];

    const createMutation = useCreateOrder();

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const request: CreateOrderRequest = {
            customerId: formData.get('customerId') as string,
            shipName: (formData.get('shipName') as string) || undefined,
            shipAddress: (formData.get('shipAddress') as string) || undefined,
            shipCity: (formData.get('shipCity') as string) || undefined,
            shipCountry: (formData.get('shipCountry') as string) || undefined,
            details: [{
                productId: Number(formData.get('productId')),
                unitPrice: Number(formData.get('unitPrice')),
                quantity: Number(formData.get('quantity')),
                discount: Number(formData.get('discount') ?? 0),
            }],
        };
        createMutation.mutate(request, { onSuccess: () => setIsCreateModalOpen(false) });
    };

    const columns: ColumnDef<Order, unknown>[] = [
        { accessorKey: 'orderId', header: 'Order ID' },
        { accessorKey: 'customerId', header: 'Customer ID' },
        {
            accessorKey: 'orderDate',
            header: 'Order Date',
            cell: (info) => {
                const val = info.getValue() as string | null;
                return val ? new Date(val).toLocaleDateString() : '—';
            },
        },
        {
            id: 'total',
            header: 'Total',
            cell: ({ row }) => `$${calculateTotal(row.original).toFixed(2)}`,
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => row.original.shippedDate
                ? <Badge variant="success">Shipped</Badge>
                : <Badge variant="neutral">Pending</Badge>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={() => setViewingOrderId(row.original.orderId)}
                >
                    View
                </Button>
            ),
        },
    ];

    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontSize: '0.875rem',
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Orders</h1>
                    <p style={{ color: 'var(--color-muted)' }}>Manage and track customer orders.</p>
                </div>
                {hasRole(['ADMIN', 'MANAGER']) && (
                    <Button onClick={() => setIsCreateModalOpen(true)}>Create Order</Button>
                )}
            </div>

            <Card>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Input
                        placeholder="Search by Customer ID..."
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

            {/* Order Detail Modal */}
            {viewingOrderId !== null && (
                <OrderDetailModal
                    orderId={viewingOrderId}
                    onClose={() => setViewingOrderId(null)}
                />
            )}

            {/* Create Order Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Order">
                <form onSubmit={handleCreateSubmit}>
                    <div className="form-group">
                        <label htmlFor="customerId">Customer</label>
                        <select id="customerId" name="customerId" required style={selectStyle}>
                            <option value="">Select a customer...</option>
                            {customers.map((c) => (
                                <option key={c.customerId} value={c.customerId}>
                                    {c.customerId} — {c.companyName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="shipName">Ship Name</label>
                        <Input id="shipName" name="shipName" />
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="shipCity">City</label>
                            <Input id="shipCity" name="shipCity" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="shipCountry">Country</label>
                            <Input id="shipCountry" name="shipCountry" />
                        </div>
                    </div>

                    <hr style={{ margin: '1.25rem 0', borderColor: 'var(--color-border)' }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Order Item</p>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="productId">Product ID</label>
                            <Input id="productId" name="productId" type="number" min="1" required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="quantity">Quantity</label>
                            <Input id="quantity" name="quantity" type="number" min="1" required />
                        </div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="unitPrice">Unit Price ($)</label>
                            <Input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="discount">Discount (0–1)</label>
                            <Input id="discount" name="discount" type="number" step="0.01" min="0" max="1" defaultValue="0" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Creating...' : 'Create Order'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};