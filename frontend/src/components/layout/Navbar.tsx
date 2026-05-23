import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 2rem',
      gap: '1rem'
    }}>
      {user && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', 
              backgroundColor: 'var(--color-surface-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{user.role}</span>
            </div>
          </div>
          <button 
            className="btn btn-ghost" 
            onClick={() => logout()}
            style={{ padding: '0.5rem', color: 'var(--color-muted)' }}
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </>
      )}
    </header>
  );
};
