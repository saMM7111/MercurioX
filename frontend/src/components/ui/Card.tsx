import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ 
  children, 
  className = '',
  style
}) => {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
};
