import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../auth/useAuth';
import { useLowStockProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useEmployees } from '../hooks/useEmployees';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { ValueType, NameType, Formatter } from 'recharts/types/component/DefaultTooltipContent';
import type { Order } from '../api/endpoints/orders';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const calculateOrderTotal = (order: Order): number => {
    if (!order.details?.length) return 0;
    return order.details.reduce((sum, d) => sum + d.unitPrice * d.quantity * (1 - (d.discount ?? 0)), 0);
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    loading?: boolean;
}> = ({ label, value, sub, color = 'var(--color-text)', loading }) => (
    <Card>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>{label}</p>
        <p style={{ fontSize: '1.9rem', fontWeight: 700, color, margin: 0, lineHeight: 1.1 }}>
            {loading ? '—' : value}
        </p>
        {sub && <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: '0.3rem 0 0' }}>{sub}</p>}
    </Card>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
    <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>{sub}</p>}
    </div>
);

export const Dashboard: React.FC = () => {
    const { user } = useAuth();

    const { data: ordersData, isLoading: isOrdersLoading } = useOrders({ page: 0, size: 1000 });
    const { data: customersData, isLoading: isCustomersLoading } = useCustomers({ page: 0, size: 1 });
    const { data: lowStockProducts, isLoading: isLowStockLoading } = useLowStockProducts();
    const { data: employeesData, isLoading: isEmployeesLoading } = useEmployees({ page: 0, size: 1 });

    const {
        totalRevenue,
        chartData,
        pendingOrders,
        shippedOrders,
        recentOrders,
        topCustomers,
        topProducts,
    } = useMemo(() => {
        const orders = ordersData?.content ?? [];
        const monthlyMap = new Map<string, { revenue: number; count: number }>();

        let total = 0;
        let pending = 0;
        let shipped = 0;

        // customer spend map
        const customerMap = new Map<string, number>();
        // product units map
        const productMap = new Map<number, { name: string; units: number; revenue: number }>();

        for (const order of orders) {
            const orderTotal = calculateOrderTotal(order);
            total += orderTotal;

            if (order.shippedDate) shipped++;
            else pending++;

            // monthly
            if (order.orderDate) {
                const d = new Date(order.orderDate);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                const existing = monthlyMap.get(key) ?? { revenue: 0, count: 0 };
                monthlyMap.set(key, { revenue: existing.revenue + orderTotal, count: existing.count + 1 });
            }

            // customer spend
            if (order.customerId) {
                customerMap.set(order.customerId, (customerMap.get(order.customerId) ?? 0) + orderTotal);
            }

            // product units
            for (const detail of order.details ?? []) {
                const existing = productMap.get(detail.productId) ?? { name: `Product #${detail.productId}`, units: 0, revenue: 0 };
                productMap.set(detail.productId, {
                    name: existing.name,
                    units: existing.units + detail.quantity,
                    revenue: existing.revenue + detail.unitPrice * detail.quantity * (1 - (detail.discount ?? 0)),
                });
            }
        }

        const sorted = Array.from(monthlyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([key, val]) => {
                const monthIndex = parseInt(key.split('-')[1], 10);
                return {
                    name: MONTH_NAMES[monthIndex],
                    revenue: Math.round(val.revenue),
                    orders: val.count,
                };
            });

        const recent = [...orders]
            .sort((a, b) => new Date(b.orderDate ?? 0).getTime() - new Date(a.orderDate ?? 0).getTime())
            .slice(0, 5);

        const topC = Array.from(customerMap.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id, spend]) => ({ id, spend }));

        const topP = Array.from(productMap.entries())
            .sort(([, a], [, b]) => b.units - a.units)
            .slice(0, 5)
            .map(([id, val]) => ({ id, ...val }));

        return {
            totalRevenue: total,
            chartData: sorted,
            pendingOrders: pending,
            shippedOrders: shipped,
            recentOrders: recent,
            topCustomers: topC,
            topProducts: topP,
        };
    }, [ordersData]);

    const totalOrders = ordersData?.totalElements ?? 0;
    const totalCustomers = customersData?.totalElements ?? 0;
    const totalEmployees = employeesData?.totalElements ?? 0;

    const orderStatusData = [
        { name: 'Shipped', value: shippedOrders },
        { name: 'Pending', value: pendingOrders },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Welcome */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Welcome back, {user?.username}</h1>
                <p style={{ color: 'var(--color-muted)' }}>Here's what's happening at MercurioX today.</p>
            </div>

            {/* ── Row 1: Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <StatCard label="Total Orders" value={totalOrders.toLocaleString()} loading={isOrdersLoading} />
                <StatCard
                    label="Total Revenue"
                    value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    loading={isOrdersLoading}
                    color="var(--color-success)"
                />
                <StatCard label="Total Customers" value={totalCustomers.toLocaleString()} loading={isCustomersLoading} />
                <StatCard
                    label="Pending Orders"
                    value={pendingOrders.toLocaleString()}
                    loading={isOrdersLoading}
                    color="var(--color-warning)"
                    sub="Awaiting shipment"
                />
                <StatCard
                    label="Low Stock Alerts"
                    value={lowStockProducts?.length ?? 0}
                    loading={isLowStockLoading}
                    color={(lowStockProducts?.length ?? 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
                />
                <StatCard label="Employees" value={totalEmployees.toLocaleString()} loading={isEmployeesLoading} />
            </div>

            {/* ── Row 2: Revenue Chart + Order Status ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                {/* Revenue + Orders Trend */}
                <Card>
                    <SectionHeader title="Revenue & Order Volume" sub="Last 12 months" />
                    <div style={{ height: '260px' }}>
                        {isOrdersLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-muted)' }}>Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="name" stroke="var(--color-muted)" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="left" stroke="var(--color-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted)" tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                                        formatter={((value: ValueType, name: NameType) => [
                                            name === 'revenue' ? `$${Number(value).toLocaleString()}` : value,
                                            name === 'revenue' ? 'Revenue' : 'Orders',
                                        ]) as Formatter<ValueType, NameType>}
                                    />

                                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-warning)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: 'var(--color-primary)' }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Revenue</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: 'hsl(38 92% 50%)' }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Orders</span>
                        </div>
                    </div>
                </Card>

                {/* Order Status Donut */}
                <Card>
                    <SectionHeader title="Order Status" sub="Shipped vs Pending" />
                    <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {isOrdersLoading ? (
                            <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {orderStatusData.map((_, index) => (
                                                <Cell key={index} fill={index === 0 ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)'} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(142 71% 45%)', margin: 0 }}>{shippedOrders}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: 0 }}>Shipped</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(38 92% 50%)', margin: 0 }}>{pendingOrders}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', margin: 0 }}>Pending</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* ── Row 3: Top Customers + Top Products ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Top Customers by Revenue */}
                <Card>
                    <SectionHeader title="Top Customers" sub="By total spend" />
                    {isOrdersLoading ? (
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Loading...</p>
                    ) : topCustomers.length === 0 ? (
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>No data</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {topCustomers.map(({ id, spend }, i) => {
                                const max = topCustomers[0].spend;
                                const pct = Math.round((spend / max) * 100);
                                return (
                                    <div key={id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                                                <span style={{ color: 'var(--color-muted)', marginRight: '0.4rem' }}>#{i + 1}</span>
                                                {id}
                                            </span>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                                ${spend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <div style={{ height: '4px', borderRadius: '9999px', backgroundColor: 'var(--color-border)' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: '9999px', backgroundColor: 'var(--color-primary)', transition: 'width 0.4s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Top Products by Units Sold */}
                <Card>
                    <SectionHeader title="Top Products" sub="By units sold" />
                    {isOrdersLoading ? (
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Loading...</p>
                    ) : topProducts.length === 0 ? (
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>No data</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {topProducts.map(({ id, name, units, revenue }, i) => {
                                const max = topProducts[0].units;
                                const pct = Math.round((units / max) * 100);
                                return (
                                    <div key={id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                                                <span style={{ color: 'var(--color-muted)', marginRight: '0.4rem' }}>#{i + 1}</span>
                                                {name}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{units} units</span>
                                                <span style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                                    ${revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ height: '4px', borderRadius: '9999px', backgroundColor: 'var(--color-border)' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: '9999px', backgroundColor: 'hsl(38 92% 50%)', transition: 'width 0.4s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Row 4: Recent Orders + Low Stock ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
                {/* Recent Orders */}
                <Card>
                    <SectionHeader title="Recent Orders" sub="Last 5 orders placed" />
                    {isOrdersLoading ? (
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Loading...</p>
                    ) : recentOrders.length === 0 ? (
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>No orders found</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Order ID', 'Customer', 'Date', 'Total', 'Status'].map((h) => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: 'var(--color-muted)', fontWeight: 500, fontSize: '0.75rem' }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.orderId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>#{order.orderId}</td>
                                    <td style={{ padding: '0.55rem 0.5rem', color: 'var(--color-muted)' }}>{order.customerId}</td>
                                    <td style={{ padding: '0.55rem 0.5rem', color: 'var(--color-muted)' }}>
                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '0.55rem 0.5rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                        ${calculateOrderTotal(order).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '0.55rem 0.5rem' }}>
                                        {order.shippedDate
                                            ? <Badge variant="success">Shipped</Badge>
                                            : <Badge variant="warning">Pending</Badge>
                                        }
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </Card>

                {/* Low Stock — scrollable, fixed height, top 5 prominent then rest on scroll */}
                <Card style={{ display: 'flex', flexDirection: 'column' }}>
                    <SectionHeader
                        title="Low Stock Products"
                        sub={`${lowStockProducts?.length ?? 0} products below reorder level`}
                    />
                    <div
                        style={{
                            overflowY: 'auto',
                            maxHeight: '260px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'var(--color-border) transparent',
                        }}
                    >
                        {isLowStockLoading ? (
                            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Loading...</p>
                        ) : (lowStockProducts?.length ?? 0) === 0 ? (
                            <p style={{ color: 'var(--color-success)', fontSize: '0.875rem' }}>All products are well stocked ✓</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
                                {lowStockProducts!.map((p, i) => {
                                    const isTop5 = i < 5;
                                    const stockPct = p.reorderLevel > 0
                                        ? Math.min(100, Math.round((p.unitsInStock / p.reorderLevel) * 100))
                                        : 100;
                                    const barColor = p.unitsInStock === 0
                                        ? 'var(--color-danger)'
                                        : stockPct < 50
                                            ? 'hsl(38 92% 50%)'
                                            : 'var(--color-primary)';
                                    return (
                                        <div
                                            key={p.productId}
                                            style={{
                                                padding: '0.5rem 0.6rem',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: isTop5 ? 'var(--color-surface-elevated)' : 'transparent',
                                                border: isTop5 ? '1px solid var(--color-border)' : '1px solid transparent',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: isTop5 ? 600 : 400 }}>
                                                    {p.productName}
                                                </span>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                                                        reorder: {p.reorderLevel}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: p.unitsInStock === 0 ? 'var(--color-danger)' : 'hsl(38 92% 50%)',
                                                    }}>
                                                        {p.unitsInStock} left
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ height: '3px', borderRadius: '9999px', backgroundColor: 'var(--color-border)' }}>
                                                <div style={{ height: '100%', width: `${stockPct}%`, borderRadius: '9999px', backgroundColor: barColor }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

        </div>
    );
};