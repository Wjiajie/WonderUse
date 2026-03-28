import React from 'react';

interface LeatherCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export const LeatherCard: React.FC<LeatherCardProps> = ({ 
  interactive = false, 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`leather-card texture-leather ${interactive ? 'interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
