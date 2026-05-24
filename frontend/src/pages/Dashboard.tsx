import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../auth/useAuth';
import { useLowStockProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { DataTable } from '../components/ui/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ValueType, NameType, Formatter } from 'recharts/types/component/DefaultTooltipContent';
import type { Order } from '../api/endpoints/orders';

interface LowStockProduct {
    productId: number;
    productName: string;
    unitsInStock: number;
    reorderLevel: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const calculateOrderTotal = (order: Order): number => {
    if (!order.details?.length) return 0;
    return order.details.reduce((sum, d) => sum + d.unitPrice * d.quantity * (1 - (d.discount ?? 0)), 0);
};

export const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // One orders fetch covers both the count (totalElements) and revenue/chart computation
    const { data: ordersData, isLoading: isOrdersLoading } = useOrders({ page: 0, size: 1000 });

    // Customers: size=1 is enough — totalElements is returned regardless of page size
    const { data: customersData, isLoading: isCustomersLoading } = useCustomers({ page: 0, size: 1 });

    const { data: lowStockProducts, isLoading: isLowStockLoading } = useLowStockProducts();

    // Compute total revenue and monthly chart data from real orders
    const { totalRevenue, chartData } = useMemo(() => {
        const orders = ordersData?.content ?? [];
        const monthlyMap = new Map<string, number>();

        let total = 0;
        for (const order of orders) {
            const orderTotal = calculateOrderTotal(order);
            total += orderTotal;

            if (order.orderDate) {
                const d = new Date(order.orderDate);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + orderTotal);
            }
        }

        // Build sorted chart entries (last 12 months that have data, or all if fewer)
        const sorted = Array.from(monthlyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([key, revenue]) => {
                const monthIndex = parseInt(key.split('-')[1], 10);
                return { name: MONTH_NAMES[monthIndex], revenue: Math.round(revenue) };
            });

        return { totalRevenue: total, chartData: sorted };
    }, [ordersData]);

    const lowStockColumns: ColumnDef<LowStockProduct, unknown>[] = [
        { accessorKey: 'productId', header: 'ID' },   // fixed: was 'id'
        { accessorKey: 'productName', header: 'Product Name' },
        { accessorKey: 'unitsInStock', header: 'Stock' },
        { accessorKey: 'reorderLevel', header: 'Reorder Level' },
    ];

    const totalOrders = ordersData?.totalElements ?? 0;
    const totalCustomers = customersData?.totalElements ?? 0;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Welcome back, {user?.username}</h1>
                <p style={{ color: 'var(--color-muted)' }}>Here is what's happening today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Total Orders</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {isOrdersLoading ? '—' : totalOrders.toLocaleString()}
                    </div>
                </Card>
                <Card>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Total Revenue</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {isOrdersLoading ? '—' : `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    </div>
                </Card>
                <Card>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Total Customers</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {isCustomersLoading ? '—' : totalCustomers.toLocaleString()}
                    </div>
                </Card>
                <Card>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Low Stock Alerts</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                        {lowStockProducts?.length ?? 0}
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card>
                    <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Revenue Overview</h2>
                    <div style={{ height: '300px' }}>
                        {isOrdersLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-muted)' }}>
                                Loading chart...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="name" stroke="var(--color-muted)" />
                                    <YAxis stroke="var(--color-muted)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                                        itemStyle={{ color: 'var(--color-primary)' }}
                                        formatter={((value: ValueType) => [`$${Number(value).toLocaleString()}`, 'Revenue']) as Formatter<ValueType, NameType>}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <Card>
                    <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Low Stock Products</h2>
                    <DataTable
                        columns={lowStockColumns}
                        data={lowStockProducts || []}
                        isLoading={isLowStockLoading}
                    />
                </Card>
            </div>
        </div>
    );
};