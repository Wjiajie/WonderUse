"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  position?: 'left' | 'right' | 'top';
  visible?: boolean;
  className?: string;
}

export function SpeechBubble({ text, position = 'right', visible = true, className }: SpeechBubbleProps) {
  const triangleBase: React.CSSProperties = {
    content: '',
    position: 'absolute',
    width: 0,
    border: '8px solid transparent',
  };

  const triangleStyles: Record<string, React.CSSProperties> = {
    right: { // 三角指向右边（猫咪在左时）
      top: '12px',
      right: '-15px',
      borderLeftColor: 'var(--color-brass)',
      borderRight: 'none',
    },
    left: { // 三角指向左边
      top: '12px',
      left: '-15px',
      borderRightColor: 'var(--color-brass)',
      borderLeft: 'none',
    },
    top: { // 三角指向上（猫咪在下时）
      top: '-15px',
      left: '20px',
      borderBottomColor: 'var(--color-brass)',
      borderTop: 'none',
    },
  };

  const innerTriangleStyles: Record<string, React.CSSProperties> = {
    right: { top: '12px', right: '-12px', borderLeftColor: 'var(--color-cream)', borderRight: 'none' },
    left:  { top: '12px', left: '-12px', borderRightColor: 'var(--color-cream)', borderLeft: 'none' },
    top:   { top: '-12px', left: '20px', borderBottomColor: 'var(--color-cream)', borderTop: 'none' },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={className}
          style={{
            position: 'absolute',
            maxWidth: '200px',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--color-cream)',
            border: '2px solid var(--color-brass)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-handwriting-stack)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.5,
            boxShadow: 'var(--shadow-raised)',
            transformOrigin: position === 'top' ? 'bottom center' : position === 'right' ? 'left center' : 'right center',
          }}
        >
          {text}
          {/* Outer triangle (border color) */}
          <span style={{ ...triangleBase, ...triangleStyles[position] } as React.CSSProperties} />
          {/* Inner triangle (fill color) */}
          <span style={{ ...triangleBase, ...innerTriangleStyles[position] } as React.CSSProperties} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
