"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreasureBoxProps {
  isOpen: boolean;
  productName: string;
  productImage?: string;
  onComplete?: () => void;
}

export function TreasureBox({ isOpen, productName, productImage, onComplete }: TreasureBoxProps) {
  useEffect(() => {
    if (isOpen && onComplete) {
      const timer = setTimeout(onComplete, 1300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(28,14,6,0.7)',
      pointerEvents: 'none',
    }}>
      {/* 宝箱 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ position: 'relative', width: 200, height: 160 }}
      >
        {/* 宝箱主体 (底部) */}
        <svg width="200" height="100" viewBox="0 0 200 100" style={{ position: 'absolute', bottom: 0 }}>
          {/* 箱体 */}
          <rect x="10" y="20" width="180" height="80" rx="8" fill="#8B4513" stroke="#5D3A1A" strokeWidth="3"/>
          {/* 木纹 */}
          <line x1="10" y1="45" x2="190" y2="45" stroke="#6B3410" strokeWidth="1.5" opacity="0.5"/>
          <line x1="10" y1="70" x2="190" y2="70" stroke="#6B3410" strokeWidth="1.5" opacity="0.5"/>
          {/* 金属装饰 */}
          <rect x="10" y="20" width="180" height="12" rx="2" fill="#DAA520"/>
          <rect x="88" y="50" width="24" height="30" rx="4" fill="#B8860B" stroke="#8B6914" strokeWidth="1.5"/>
          <circle cx="100" cy="65" r="5" fill="#F5C842"/>
          {/* 锁扣 */}
          <rect x="94" y="62" width="12" height="6" rx="2" fill="#8B6914"/>
        </svg>

        {/* 宝箱盖 (会旋转打开) */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 70,
            left: 10,
            width: 180,
            height: 60,
            transformOrigin: 'center bottom',
          }}
          initial={{ rotateX: 0 }}
          animate={isOpen ? { rotateX: -110 } : { rotateX: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.3, 0.64, 1] }}
        >
          <svg width="180" height="60" viewBox="0 0 180 60">
            {/* 盖子 */}
            <path d="M5 55 Q5 10 90 5 Q175 10 175 55 Z" fill="#A0522D" stroke="#5D3A1A" strokeWidth="3"/>
            {/* 顶部金属装饰 */}
            <path d="M5 55 Q5 10 90 5 Q175 10 175 55" fill="none" stroke="#DAA520" strokeWidth="3"/>
            {/* 盖子木质纹理 */}
            <path d="M20 50 Q90 20 160 50" stroke="#8B4513" strokeWidth="1" opacity="0.4" fill="none"/>
            {/* 中央装饰 */}
            <ellipse cx="90" cy="35" rx="25" ry="12" fill="#DAA520" opacity="0.8"/>
            <ellipse cx="90" cy="35" rx="18" ry="8" fill="#F5C842"/>
          </svg>
        </motion.div>

        {/* 产品从宝箱弹出 (只在外层 isOpen 时渲染) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.5 }}
              animate={{ y: -20, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 80,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '50%',
                border: '2px solid rgba(218,165,32,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 0 20px rgba(218,165,32,0.5)',
              }}
            >
              {productImage ? (
                <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem' }}>📦</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 文字 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              marginTop: 20,
              fontFamily: 'var(--font-handwriting-stack)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-gold)',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            ✦ {productName}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 粒子光效 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * 360;
              const dx = Math.cos((angle * Math.PI) / 180) * 80;
              const dy = Math.sin((angle * Math.PI) / 180) * 80 - 40;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
                  transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: ['#DAA520', '#F5C842', '#CD7F32', '#FFD700'][i % 4],
                    boxShadow: '0 0 6px rgba(218,165,32,0.8)',
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
