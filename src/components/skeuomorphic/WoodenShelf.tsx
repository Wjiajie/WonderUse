import React from 'react';

interface WoodenShelfProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const WoodenShelf: React.FC<WoodenShelfProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`wooden-shelf texture-wood ${className}`}
      style={{
        width: '100%',
        padding: 'var(--space-4)',
        borderBottom: '8px solid var(--color-wood-dark)', // Creates the 3D lip effect
        boxShadow: 'var(--shadow-shelf)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        alignItems: 'baseline',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
