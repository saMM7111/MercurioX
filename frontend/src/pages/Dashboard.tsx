import React from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../auth/useAuth';
import { useLowStockProducts } from '../hooks/useProducts';
import { DataTable } from '../components/ui/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart until stats endpoint is fully wired
const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: lowStockProducts, isLoading: isLowStockLoading } = useLowStockProducts();

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'productName', header: 'Product Name' },
    { accessorKey: 'unitsInStock', header: 'Stock' },
    { accessorKey: 'reorderLevel', header: 'Reorder Level' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Welcome back, {user?.username}</h1>
        <p style={{ color: 'var(--color-muted)' }}>Here is what's happening today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Total Orders</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>1,234</div>
        </Card>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Total Revenue</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>$45,678</div>
        </Card>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Total Customers</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>892</div>
        </Card>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Low Stock Alerts</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            {lowStockProducts?.length || 0}
          </div>
        </Card>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Revenue Overview</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} 
                  itemStyle={{ color: 'var(--color-primary)' }} 
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Low Stock Products</h2>
          <DataTable 
            columns={columns} 
            data={lowStockProducts || []} 
            isLoading={isLowStockLoading}
          />
        </Card>
      </div>
    </div>
  );
};
