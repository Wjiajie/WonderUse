"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface GlassGaugeProps {
  value: number; // 0 to 100+
  max?: number;
}

export const GlassGauge: React.FC<GlassGaugeProps> = ({ value, max = 100 }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  let fillClass = '';
  if (value === 0) fillClass = 'rgba(255,255,255,0)';
  else if (value <= 5) fillClass = 'var(--love-level-1)';
  else if (value <= 15) fillClass = 'var(--love-level-2)';
  else if (value <= 30) fillClass = 'var(--love-level-3)';
  else if (value <= 50) fillClass = 'var(--love-level-4)';
  else fillClass = 'var(--love-level-5)';

  return (
    <div style={{
      width: '100%',
      height: 'var(--space-6)',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      position: 'relative'
    }} className="texture-glass">
      
      {/* Container background ticks/marks could go here */}

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          height: '100%',
          backgroundColor: fillClass,
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)'
        }}
      />
      
      {/* Glass reflection overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
        borderRadius: 'var(--radius-full) var(--radius-full) 0 0'
      }} />
    </div>
  );
};
