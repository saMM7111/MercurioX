import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useEmployees, useEmployeeById, useCreateEmployee, type Employee, type CreateEmployeeRequest } from '../hooks/useEmployees';
import { useAuth } from '../auth/useAuth';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

const Field: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{label}</span>
        <p style={{ margin: '0.1rem 0 0', fontWeight: 500 }}>{value || '—'}</p>
    </div>
);

const EmployeeDetailModal: React.FC<{ employeeId: number; onClose: () => void }> = ({ employeeId, onClose }) => {
    const { data: emp, isLoading } = useEmployeeById(employeeId);

    return (
        <Modal isOpen={true} onClose={onClose} title="Employee Details">
            {isLoading && <p style={{ color: 'var(--color-muted)' }}>Loading...</p>}
            {emp && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{emp.titleOfCourtesy} {emp.firstName} {emp.lastName}</p>
                            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem' }}>{emp.title}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <Field label="Employee ID" value={emp.employeeId} />
                        <Field label="Reports To (ID)" value={emp.reportsTo} />
                        <Field label="Hire Date" value={emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : undefined} />
                        <Field label="Birth Date" value={emp.birthDate ? new Date(emp.birthDate).toLocaleDateString() : undefined} />
                        <Field label="Phone" value={emp.homePhone} />
                        <Field label="Extension" value={emp.extension} />
                    </div>

                    <hr style={{ borderColor: 'var(--color-border)', margin: '1rem 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <Field label="Address" value={emp.address} />
                        <Field label="City" value={emp.city} />
                        <Field label="Region" value={emp.region} />
                        <Field label="Postal Code" value={emp.postalCode} />
                        <Field label="Country" value={emp.country} />
                    </div>

                    {emp.notes && (
                        <>
                            <hr style={{ borderColor: 'var(--color-border)', margin: '1rem 0' }} />
                            <Field label="Notes" value={emp.notes} />
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export const Employees: React.FC = () => {
    const { hasRole } = useAuth();
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [viewingEmployeeId, setViewingEmployeeId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, isLoading } = useEmployees({
        page: pagination.pageIndex,
        size: pagination.pageSize,
    });

    const createMutation = useCreateEmployee();

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const request: CreateEmployeeRequest = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            title: (formData.get('title') as string) || undefined,
            titleOfCourtesy: (formData.get('titleOfCourtesy') as string) || undefined,
            city: (formData.get('city') as string) || undefined,
            country: (formData.get('country') as string) || undefined,
            homePhone: (formData.get('homePhone') as string) || undefined,
            address: (formData.get('address') as string) || undefined,
            notes: (formData.get('notes') as string) || undefined,
            reportsTo: formData.get('reportsTo') ? Number(formData.get('reportsTo')) : undefined,
        };
        createMutation.mutate(request, {
            onSuccess: () => setIsCreateModalOpen(false),
        });
    };

    const columns: ColumnDef<Employee, unknown>[] = [
        { accessorKey: 'employeeId', header: 'ID' },
        { accessorKey: 'firstName', header: 'First Name' },
        { accessorKey: 'lastName', header: 'Last Name' },
        { accessorKey: 'title', header: 'Title' },
        { accessorKey: 'city', header: 'City' },
        { accessorKey: 'country', header: 'Country' },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={() => setViewingEmployeeId(row.original.employeeId)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Employees</h1>
                    <p style={{ color: 'var(--color-muted)' }}>Manage employee records. Restricted to Admin and Manager roles.</p>
                </div>
                {hasRole(['ADMIN']) && (
                    <Button onClick={() => setIsCreateModalOpen(true)}>Add Employee</Button>
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

            {/* View Detail Modal */}
            {viewingEmployeeId !== null && (
                <EmployeeDetailModal
                    employeeId={viewingEmployeeId}
                    onClose={() => setViewingEmployeeId(null)}
                />
            )}

            {/* Create Employee Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Employee">
                <form onSubmit={handleCreateSubmit}>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="firstName">First Name *</label>
                            <Input id="firstName" name="firstName" maxLength={10} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="lastName">Last Name *</label>
                            <Input id="lastName" name="lastName" maxLength={20} required />
                        </div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="titleOfCourtesy">Courtesy Title</label>
                            <Input id="titleOfCourtesy" name="titleOfCourtesy" placeholder="Mr./Ms./Dr." maxLength={25} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="title">Job Title</label>
                            <Input id="title" name="title" maxLength={30} />
                        </div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="city">City</label>
                            <Input id="city" name="city" maxLength={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="country">Country</label>
                            <Input id="country" name="country" maxLength={15} />
                        </div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="homePhone">Phone</label>
                            <Input id="homePhone" name="homePhone" maxLength={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="reportsTo">Reports To (Employee ID)</label>
                            <Input id="reportsTo" name="reportsTo" type="number" min="1" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <Input id="address" name="address" maxLength={60} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.875rem', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving...' : 'Add Employee'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};