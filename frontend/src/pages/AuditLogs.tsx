import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuditLogs } from '../hooks/useAuditLogs';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

interface AuditLog {
    id: string;
    createdAt: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    newValue?: string | null;
    oldValue?: string | null;
}

const ACTION_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
};

const ENTITY_LABELS: Record<string, string> = {
    Customer: '🏢 Customer',
    Employee: '👤 Employee',
    Product: '📦 Product',
    Order: '🛒 Order',
};

const FIELD_LABELS: Record<string, string> = {
    productId: 'Product ID',
    productName: 'Product Name',
    unitPrice: 'Unit Price',
    unitsInStock: 'Units In Stock',
    unitsOnOrder: 'Units On Order',
    reorderLevel: 'Reorder Level',
    discontinued: 'Status',
    categoryId: 'Category ID',
    supplierId: 'Supplier ID',
    quantityPerUnit: 'Quantity Per Unit',
    employeeId: 'Employee ID',
    firstName: 'First Name',
    lastName: 'Last Name',
    title: 'Title',
    titleOfCourtesy: 'Courtesy',
    city: 'City',
    country: 'Country',
    homePhone: 'Phone',
    hireDate: 'Hire Date',
    birthDate: 'Birth Date',
    reportsTo: 'Reports To',
    customerId: 'Customer ID',
    companyName: 'Company Name',
    contactName: 'Contact Name',
    contactTitle: 'Contact Title',
    address: 'Address',
    region: 'Region',
    postalCode: 'Postal Code',
    phone: 'Phone',
    fax: 'Fax',
    orderId: 'Order ID',
    orderDate: 'Order Date',
    shipName: 'Ship Name',
    shipCity: 'Ship City',
    shipCountry: 'Ship Country',
};

function formatValue(key: string, value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (key === 'discontinued') return value ? 'Discontinued' : 'Active';
    if (key === 'unitPrice') return `$${Number(value).toFixed(2)}`;
    if ((key === 'hireDate' || key === 'birthDate' || key === 'orderDate') && value) {
        return new Date(value as string).toLocaleDateString();
    }
    return String(value);
}

function JsonViewer({ raw, label, color }: { raw: string | null | undefined; label: string; color: string }) {
    if (!raw) return null;

    let parsed: Record<string, unknown> | null = null;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    const entries = Object.entries(parsed ?? {}).filter(
        ([key, val]) => val !== null && val !== undefined && key !== 'notes' && key !== 'photoPath'
    );

    if (entries.length === 0) return null;

    return (
        <div>
            <p style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
            }}>
                {label}
            </p>
            <div style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem 1.5rem',
            }}>
                {entries.map(([key, val]) => (
                    <div key={key}>
                        <p style={{
                            fontSize: '0.65rem',
                            color: 'var(--color-muted)',
                            marginBottom: '0.1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: 0,
                        }}>
                            {FIELD_LABELS[key] ?? key}
                        </p>
                        <p style={{
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            margin: 0,
                            color: key === 'discontinued'
                                ? (val ? 'var(--color-danger)' : 'var(--color-success)')
                                : 'var(--color-text)',
                        }}>
                            {formatValue(key, val)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function resolveLabel(log: AuditLog): string {
    if (!log.newValue) return log.entityId || '—';
    try {
        const parsed = JSON.parse(log.newValue);
        if (log.entityType === 'Employee') {
            const name = [parsed.firstName, parsed.lastName].filter(Boolean).join(' ');
            return name || log.entityId;
        }
        if (log.entityType === 'Customer') {
            return parsed.companyName || log.entityId;
        }
        if (log.entityType === 'Product') {
            return parsed.productName || log.entityId;
        }
        return log.entityId;
    } catch {
        return log.entityId;
    }
}

const ENTITY_TYPES = ['All', 'Customer', 'Employee', 'Product', 'Order'];
const ACTION_TYPES = ['All', 'CREATE', 'UPDATE', 'DELETE'];

export const AuditLogs: React.FC = () => {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15,
    });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [entityFilter, setEntityFilter] = useState('All');
    const [actionFilter, setActionFilter] = useState('All');
    const [searchId, setSearchId] = useState('');

    const { data, isLoading } = useAuditLogs({
        page: pagination.pageIndex,
        size: pagination.pageSize,
    });

    const filtered = (data?.content ?? []).filter((log: AuditLog) => {
        if (entityFilter !== 'All' && log.entityType !== entityFilter) return false;
        if (actionFilter !== 'All' && log.action !== actionFilter) return false;
        if (searchId && !log.entityId?.toLowerCase().includes(searchId.toLowerCase())) return false;
        return true;
    });

    const columns: ColumnDef<AuditLog, string>[] = [
        {
            accessorKey: 'createdAt',
            header: 'Timestamp',
            cell: (info) => (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(info.getValue()).toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: (info) => {
                const action = info.getValue();
                return (
                    <Badge variant={ACTION_VARIANTS[action] ?? 'neutral'}>
                        {action}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'entityType',
            header: 'Entity',
            cell: (info) => {
                const type = info.getValue();
                return (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {ENTITY_LABELS[type] ?? type}
                    </span>
                );
            },
        },
        {
            id: 'label',
            header: 'Name / ID',
            cell: ({ row }) => (
                <span style={{ fontSize: '0.8rem' }}>
                    {resolveLabel(row.original)}
                </span>
            ),
        },
        {
            accessorKey: 'entityId',
            header: 'Entity ID',
            cell: (info) => (
                <code style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    {info.getValue() || '—'}
                </code>
            ),
        },
        {
            accessorKey: 'userId',
            header: 'User ID',
            cell: (info) => (
                <code style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                    {info.getValue()
                        ? String(info.getValue()).slice(0, 8) + '…'
                        : <span style={{ opacity: 0.4 }}>system</span>
                    }
                </code>
            ),
        },
        {
            id: 'details',
            header: '',
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => setSelectedLog(row.original)}
                >
                    View
                </Button>
            ),
        },
    ];

    const pillStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.3rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 500,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--color-muted)',
        transition: 'all 0.15s ease',
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Audit Logs</h1>
                <p style={{ color: 'var(--color-muted)' }}>
                    System-wide trail of all data modifications — customers, employees, products, and orders.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                {[
                    { label: 'Total Events', value: data?.totalElements ?? '—', color: 'var(--color-text)' },
                    { label: 'Creates', value: (data?.content ?? []).filter((l: AuditLog) => l.action === 'CREATE').length, color: 'var(--color-success)' },
                    { label: 'Updates', value: (data?.content ?? []).filter((l: AuditLog) => l.action === 'UPDATE').length, color: 'var(--color-warning)' },
                    { label: 'Deletes', value: (data?.content ?? []).filter((l: AuditLog) => l.action === 'DELETE').length, color: 'var(--color-danger)' },
                ].map(({ label, value, color }) => (
                    <Card key={label}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>{label}</p>
                        <p style={{ fontSize: '1.75rem', fontWeight: 700, color, margin: 0 }}>{value}</p>
                    </Card>
                ))}
            </div>

            <Card>
                <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {ENTITY_TYPES.map((e) => (
                            <button
                                key={e}
                                style={pillStyle(entityFilter === e)}
                                onClick={() => { setEntityFilter(e); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                            >
                                {ENTITY_LABELS[e] ?? e}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {ACTION_TYPES.map((a) => (
                            <button
                                key={a}
                                style={pillStyle(actionFilter === a)}
                                onClick={() => { setActionFilter(a); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    <Input
                        placeholder="Search by entity ID…"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        style={{ maxWidth: '220px', marginLeft: 'auto' }}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={filtered}
                    pageCount={data?.totalPages ?? -1}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    isLoading={isLoading}
                />
            </Card>

            {selectedLog && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedLog(null)}
                    title={`${selectedLog.action} · ${selectedLog.entityType}`}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Meta grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            padding: '1rem',
                            backgroundColor: 'var(--color-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            {[
                                { label: 'Log ID', value: selectedLog.id },
                                { label: 'Timestamp', value: new Date(selectedLog.createdAt).toLocaleString() },
                                { label: 'Action', value: selectedLog.action },
                                { label: 'Entity Type', value: ENTITY_LABELS[selectedLog.entityType] ?? selectedLog.entityType },
                                { label: 'Entity ID', value: selectedLog.entityId || '—' },
                                { label: 'Name / Label', value: resolveLabel(selectedLog) },
                                { label: 'User ID', value: selectedLog.userId ?? 'system' },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: '0.15rem' }}>{label}</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0, wordBreak: 'break-all' }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <JsonViewer
                            raw={selectedLog.newValue}
                            label="New Value"
                            color="var(--color-success)"
                        />

                        <JsonViewer
                            raw={selectedLog.oldValue}
                            label="Previous Value"
                            color="var(--color-danger)"
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <Button variant="ghost" onClick={() => setSelectedLog(null)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};