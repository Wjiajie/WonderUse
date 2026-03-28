import React from 'react';

interface ParchmentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ParchmentInput: React.FC<ParchmentInputProps> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`texture-parchment ${className}`}
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-wood-medium)',
        outline: 'none',
        fontFamily: 'var(--font-handwriting)',
        fontSize: 'var(--text-lg)',
        width: '100%'
      }}
      {...props}
    />
  );
};

export const ParchmentTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`texture-parchment ${className}`}
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-wood-medium)',
        outline: 'none',
        fontFamily: 'var(--font-handwriting)',
        fontSize: 'var(--text-lg)',
        width: '100%',
        minHeight: '120px',
        resize: 'vertical'
      }}
      {...props}
    />
  );
};
