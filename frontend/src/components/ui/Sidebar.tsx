import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { LayoutDashboard, Package, ShoppingCart, Users, Briefcase, FileClock } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/products', label: 'Products', icon: <Package size={20} /> },
    { to: '/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { to: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { to: '/employees', label: 'Employees', icon: <Briefcase size={20} />, roles: ['ADMIN', 'MANAGER'] },
    { to: '/audit-logs', label: 'Audit Logs', icon: <FileClock size={20} />, roles: ['ADMIN'] },
  ];

  return (
    <aside style={{ 
      width: '250px', 
      backgroundColor: 'var(--color-surface-raised)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '1.5rem 1rem'
    }}>
      <div style={{ paddingBottom: '2rem', paddingLeft: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>Northwind</h2>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          if (item.roles && !hasRole(item.roles as any)) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'var(--color-muted)',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
