"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface GlassGaugeProps {
  value: number; // 0 to max
  max?: number;
  label?: string;
}

const LOVE_LABELS = ['相识', '熟悉', '喜欢', '热爱', '挚爱'];

export const GlassGauge: React.FC<GlassGaugeProps> = ({ value, max = 100, label }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  let fillColor = 'rgba(255,255,255,0)';
  let levelIndex = 0;
  if (value === 0) { fillColor = 'rgba(255,255,255,0)'; levelIndex = 0; }
  else if (value <= 5)  { fillColor = 'var(--love-level-1)'; levelIndex = 0; }
  else if (value <= 15) { fillColor = 'var(--love-level-2)'; levelIndex = 1; }
  else if (value <= 30) { fillColor = 'var(--love-level-3)'; levelIndex = 2; }
  else if (value <= 50) { fillColor = 'var(--love-level-4)'; levelIndex = 3; }
  else                  { fillColor = 'var(--love-level-5)'; levelIndex = 4; }

  const levelName = value > 0 ? LOVE_LABELS[levelIndex] : '尚无记录';

  return (
    <div>
      {/* 刻度标签行 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 'var(--space-2)',
      }}>
        {label && (
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-wood-medium)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {label}
          </span>
        )}
        <span style={{
          fontFamily: 'var(--font-handwriting-stack)',
          fontSize: 'var(--text-sm)',
          color: fillColor === 'rgba(255,255,255,0)' ? 'var(--color-text-muted)' : fillColor,
          fontWeight: 700,
          marginLeft: 'auto',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          transition: 'color 0.4s',
        }}>
          {levelName}
        </span>
      </div>

      {/* 温度槽轨道 */}
      <div
        className="texture-glass"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`物性温度：${levelName}，${Math.round(percentage)}%`}
        style={{
          width: '100%',
          height: 'var(--space-6)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* 填充条 */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{
            height: '100%',
            background: percentage > 0
              ? `linear-gradient(90deg, ${fillColor}CC, ${fillColor})`
              : 'transparent',
            boxShadow: percentage > 0
              ? `inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 0 8px ${fillColor}55`
              : 'none',
            position: 'relative',
            borderRadius: 'var(--radius-full)',
          }}
        />

        {/* 玻璃高光 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)',
          borderRadius: 'var(--radius-full) var(--radius-full) 0 0',
          pointerEvents: 'none',
        }} />

        {/* 刻度线 */}
        {[20, 40, 60, 80].map(tick => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: `${tick}%`,
              width: '1px',
              background: 'rgba(255,255,255,0.2)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};
