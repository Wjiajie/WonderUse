"use client";

import React, { useCallback, useRef, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 70 }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const isAtTop = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only activate when at top
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      isAtTop.current = true;
      setPulling(true);
      setPullDist(0);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || startY.current === null) return;
    const currentY = e.touches[0].clientY;
    const dist = Math.max(0, currentY - startY.current);
    setPullDist(dist);
    // Visual resistance: the further you pull, the harder it gets
    const resisted = Math.min(dist, dist * 0.4 + dist);
    controls.start({ y: resisted, opacity: Math.min(1, resisted / threshold) });
  }, [pulling, controls, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDist > threshold && !refreshing) {
      setRefreshing(true);
      controls.start({ y: 0, opacity: 0, transition: { duration: 0.2 } });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    } else {
      controls.start({ y: 0, opacity: 0, transition: { duration: 0.25 } });
    }
    setPullDist(0);
    startY.current = null;
    isAtTop.current = false;
  }, [pulling, pullDist, threshold, refreshing, onRefresh, controls]);

  const spinnerRotation = refreshing ? { rotate: 360 } : { rotate: 0 };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        animate={controls}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: pullDist,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '8px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {refreshing ? (
          <motion.div
            animate={spinnerRotation}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '20px' }}
          >
            🔄
          </motion.div>
        ) : pullDist > 20 ? (
          <motion.div
            animate={{ y: Math.min(pullDist * 0.1, 10) }}
            style={{
              fontSize: '20px',
              opacity: Math.min(1, pullDist / threshold),
            }}
          >
            {pullDist >= threshold ? '⬇️' : '↕️'}
          </motion.div>
        ) : null}
      </motion.div>

      {/* Refresh complete flash */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--color-brass), var(--color-gold), var(--color-brass))',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {children}
    </div>
  );
}
