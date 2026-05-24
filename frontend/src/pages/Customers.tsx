import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { useAuth } from '../auth/useAuth';
import type { Customer, CreateCustomerRequest } from '../api/endpoints/customers';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

export const Customers: React.FC = () => {
    const { hasRole } = useAuth();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState('');

    const { data, isLoading } = useCustomers({
        page: pagination.pageIndex,
        size: pagination.pageSize,
    });

    const createMutation = useCreateCustomer();

    const handleCreateSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.currentTarget);
        const request: CreateCustomerRequest = {
            customerId: (formData.get('customerId') as string).toUpperCase(),
            companyName: formData.get('companyName') as string,
            contactName: (formData.get('contactName') as string) || undefined,
            contactTitle: (formData.get('contactTitle') as string) || undefined,
            address: (formData.get('address') as string) || undefined,
            city: (formData.get('city') as string) || undefined,
            region: (formData.get('region') as string) || undefined,
            postalCode: (formData.get('postalCode') as string) || undefined,
            country: (formData.get('country') as string) || undefined,
            phone: (formData.get('phone') as string) || undefined,
            fax: (formData.get('fax') as string) || undefined,
        };
        createMutation.mutate(request, {
            onSuccess: () => setIsCreateModalOpen(false),
            onError: (err: unknown) => {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setError(msg ?? 'Failed to create customer.');
            },
        });
    };

    const columns: ColumnDef<Customer, unknown>[] = [
        { accessorKey: 'customerId', header: 'ID' },
        { accessorKey: 'companyName', header: 'Company Name' },
        { accessorKey: 'contactName', header: 'Contact Name' },
        { accessorKey: 'contactTitle', header: 'Title' },
        { accessorKey: 'country', header: 'Country' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Customers</h1>
                    <p style={{ color: 'var(--color-muted)' }}>View and manage customer details.</p>
                </div>
                {hasRole(['ADMIN', 'MANAGER']) && (
                    <Button onClick={() => { setError(''); setIsCreateModalOpen(true); }}>
                        Add Customer
                    </Button>
                )}
            </div>

            <Card>
                <DataTable
                    columns={columns}
                    data={data?.content ?? []}
                    pageCount={data?.totalPages ?? -1}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    isLoading={isLoading}
                />
            </Card>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Customer">
                <form onSubmit={handleCreateSubmit}>
                    {error && (
                        <div style={{ padding: '0.75rem', backgroundColor: 'hsl(0 84% 60% / 0.1)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="customerId">Customer ID * <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>(max 5 chars)</span></label>
                            <Input id="customerId" name="customerId" maxLength={5} required style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div style={{ flex: 2 }}>
                            <label htmlFor="companyName">Company Name *</label>
                            <Input id="companyName" name="companyName" maxLength={40} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="contactName">Contact Name</label>
                            <Input id="contactName" name="contactName" maxLength={30} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="contactTitle">Contact Title</label>
                            <Input id="contactTitle" name="contactTitle" maxLength={30} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <Input id="address" name="address" maxLength={60} />
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="city">City</label>
                            <Input id="city" name="city" maxLength={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="region">Region</label>
                            <Input id="region" name="region" maxLength={15} />
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="postalCode">Postal Code</label>
                            <Input id="postalCode" name="postalCode" maxLength={10} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="country">Country</label>
                            <Input id="country" name="country" maxLength={15} />
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="phone">Phone</label>
                            <Input id="phone" name="phone" maxLength={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="fax">Fax</label>
                            <Input id="fax" name="fax" maxLength={24} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving...' : 'Add Customer'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};