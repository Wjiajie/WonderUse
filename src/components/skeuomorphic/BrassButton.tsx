import React from 'react';

interface BrassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  children: React.ReactNode;
}

export const BrassButton: React.FC<BrassButtonProps> = ({ 
  variant = 'primary', 
  type = 'button',
  children, 
  className = '', 
  ...props 
}) => {
  const getVariantStyles = () => {
    switch(variant) {
      case 'secondary':
        return 'texture-brass btn-secondary';
      case 'ghost':
        return 'btn-ghost';
      case 'icon':
        return 'texture-brass btn-icon';
      case 'primary':
      default:
        return 'texture-brass';
    }
  };

  return (
    <button 
      className={`btn-brass ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
