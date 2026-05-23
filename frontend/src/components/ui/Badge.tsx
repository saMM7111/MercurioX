import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: BadgeVariant;
  className?: string;
}> = ({ 
  children, 
  variant = 'neutral',
  className = ''
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};
