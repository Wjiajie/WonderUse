import React from 'react';

interface ParchmentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ParchmentInput = React.forwardRef<HTMLInputElement, ParchmentInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`texture-parchment ${className}`}
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid rgba(93,64,55,0.35)',
          outline: 'none',
          fontFamily: 'var(--font-handwriting-stack)',
          fontSize: 'var(--text-base)',
          width: '100%',
          color: 'var(--color-text-primary)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          /* 确保最小触摸目标高度 */
          minHeight: '44px',
        }}
        {...props}
      />
    );
  }
);
ParchmentInput.displayName = 'ParchmentInput';

export const ParchmentTextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`texture-parchment ${className}`}
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid rgba(93,64,55,0.35)',
          outline: 'none',
          fontFamily: 'var(--font-handwriting-stack)',
          fontSize: 'var(--text-base)',
          width: '100%',
          minHeight: '120px',
          resize: 'vertical',
          color: 'var(--color-text-primary)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          lineHeight: 1.6,
        }}
        {...props}
      />
    );
  }
);
ParchmentTextArea.displayName = 'ParchmentTextArea';
