import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useEmployees, useEmployeeById, type Employee } from '../hooks/useEmployees';
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
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-surface-2, var(--color-border))', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{emp.titleOfCourtesy} {emp.firstName} {emp.lastName}</p>
                            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem' }}>{emp.title}</p>
                        </div>
                    </div>

                    {/* Details grid */}
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
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [viewingEmployeeId, setViewingEmployeeId] = useState<number | null>(null);

    const { data, isLoading } = useEmployees({
        page: pagination.pageIndex,
        size: pagination.pageSize,
    });

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
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Employees</h1>
                <p style={{ color: 'var(--color-muted)' }}>Manage employee records. Restricted to Admin and Manager roles.</p>
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

            {viewingEmployeeId !== null && (
                <EmployeeDetailModal
                    employeeId={viewingEmployeeId}
                    onClose={() => setViewingEmployeeId(null)}
                />
            )}
        </div>
    );
};