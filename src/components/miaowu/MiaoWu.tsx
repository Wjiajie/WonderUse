"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MiaoWuState = 'idle' | 'happy' | 'curious' | 'surprised';

interface MiaoWuProps {
  currentState?: MiaoWuState;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const MiaoWu: React.FC<MiaoWuProps> = ({ 
  currentState = 'idle', 
  onClick,
  size = 'medium',
  className = ''
}) => {
  const [activeState, setActiveState] = useState<MiaoWuState>(currentState);

  // Sync with prop changes
  useEffect(() => {
    setActiveState(currentState);
  }, [currentState]);

  const getImageSrc = (state: MiaoWuState) => {
    switch(state) {
      case 'happy': return '/miaowu/happy.png';
      case 'curious': return '/miaowu/curious.png';
      case 'surprised': return '/miaowu/surprised.png';
      case 'idle':
      default: return '/miaowu/idle.png';
    }
  };

  const getDimensions = () => {
    switch(size) {
      case 'small': return { width: 80, height: 80 };
      case 'large': return { width: 200, height: 200 };
      case 'medium':
      default: return { width: 140, height: 140 };
    }
  };

  const dims = getDimensions();

  // Handle click logic: e.g. switch to surprised briefly
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setActiveState('surprised');
      setTimeout(() => {
        setActiveState(currentState);
      }, 2000);
    }
  };

  return (
    <div 
      className={`miaowu-container ${className}`} 
      onClick={handleClick}
      style={{
        width: dims.width,
        height: dims.height,
        position: 'relative',
        cursor: 'pointer',
        filter: 'drop-shadow(var(--shadow-obj))'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={activeState}
          src={getImageSrc(activeState)}
          alt={`MiaoWu is ${activeState}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </AnimatePresence>
    </div>
  );
};
