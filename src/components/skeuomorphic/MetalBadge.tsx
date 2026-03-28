"use client";

import { motion } from 'framer-motion';

interface MetalBadgeProps {
  emoji: string;
  title: string;
  description?: string;
  unlockedAt?: string;
}

export function MetalBadge({ emoji, title, description, unlockedAt }: MetalBadgeProps) {
  const isUnlocked = !!unlockedAt;

  return (
    <div
      title={isUnlocked ? `${title} — 解锁于 ${new Date(unlockedAt!).toLocaleDateString()}` : `隐藏成就 — ${description || '继续探索吧'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        cursor: isUnlocked ? 'default' : 'help',
      }}
    >
      <motion.div
        whileHover={isUnlocked
          ? { scale: 1.08, boxShadow: '0 0 20px rgba(218,165,32,0.6)' }
          : { filter: 'grayscale(0.7) opacity(0.6)', boxShadow: '0 0 12px rgba(218,165,32,0.2)' }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          ...(isUnlocked ? {
            background: 'radial-gradient(circle at 35% 35%, var(--color-gold), var(--color-brass) 70%)',
            border: '3px solid var(--color-gold)',
            boxShadow: 'var(--shadow-raised), 0 0 12px rgba(218,165,32,0.35)',
          } : {
            background: 'var(--color-wood-medium)',
            border: '2px dashed rgba(93,64,55,0.3)',
            filter: 'grayscale(1) opacity(0.4)',
          }),
        }}
      >
        <span style={{ lineHeight: 1 }}>{isUnlocked ? emoji : '?'}</span>
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-heading)',
          color: isUnlocked ? 'var(--color-gold-readable)' : 'var(--color-text-muted)',
          fontWeight: 600,
          maxWidth: '72px',
          lineHeight: 1.3,
        }}>
          {isUnlocked ? title : '隐藏成就'}
        </p>
      </div>
    </div>
  );
}
