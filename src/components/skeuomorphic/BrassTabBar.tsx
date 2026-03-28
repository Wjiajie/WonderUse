"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* 手工雕刻风格 SVG 图标 */
const ShelfIcon = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" fill="none">
    <rect x="3" y="14" width="18" height="2.5" rx="1" fill="currentColor" stroke="none"/>
    <rect x="3" y="19" width="18" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/>
    <path d="M6 14V8a1 1 0 011-1h2.5a1 1 0 011 1v6" strokeLinecap="round"/>
    <path d="M13.5 14V7a1 1 0 011-1H17a1 1 0 011 1v7" strokeLinecap="round"/>
    <path d="M6 7h5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const PraiseIcon = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" fill="none">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round"/>
    {/* 小星星装饰 */}
    <path d="M17 6l0.5 1 1 0.15-0.75 0.73 0.18 1.05L17 8.5l-0.93 0.48 0.18-1.05L15.5 7.15l1-0.15z" fill="currentColor" stroke="none" opacity="0.7"/>
  </svg>
);

const AchievementIcon = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" fill="none">
    <circle cx="12" cy="9" r="5.5" strokeLinecap="round"/>
    {/* 内圈 */}
    <circle cx="12" cy="9" r="3" strokeLinecap="round" opacity="0.5"/>
    {/* 绶带 */}
    <path d="M8.5 14.5L7 20l5-2.5 5 2.5-1.5-5.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* 星 */}
    <path d="M12 7l0.6 1.3 1.4 0.2-1 1 0.24 1.4L12 10.3l-1.24.6 0.24-1.4-1-1 1.4-.2z" fill="currentColor" stroke="none"/>
  </svg>
);

export const BrassTabBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: '展架', path: '/shelf', icon: <ShelfIcon />, label: '我的展架' },
    { name: '夸夸', path: '/praise', icon: <PraiseIcon />, label: '夸夸物品' },
    { name: '成就', path: '/achievements', icon: <AchievementIcon />, label: '我的成就' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="主导航"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -3px 0 rgba(62,39,35,0.3), 0 -8px 24px rgba(62,39,35,0.25)',
        /* 在 safe-area 设备（如 iPhone）上留出底部间距 */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      className="texture-brass"
    >
      {navItems.map(item => {
        const isActive = pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            href={item.path}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={isActive ? 'tab-item-active' : ''}
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              padding: 'var(--space-2) 0',
              color: isActive ? 'var(--color-wood-dark)' : 'rgba(62,39,35,0.55)',
              transition: 'color 0.2s ease, transform 0.2s ease',
              position: 'relative',
            }}
          >
            {/* 激活指示器 — 刻线 */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: '2.5px',
                background: 'linear-gradient(90deg, transparent, var(--color-wood-dark), transparent)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.4)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}

            {item.icon}

            <span style={{
              fontSize: '0.65rem',
              marginTop: '3px',
              fontFamily: 'var(--font-heading)',
              fontWeight: isActive ? 'bold' : 'normal',
              letterSpacing: '0.05em',
              textShadow: isActive ? '0 1px 0 rgba(255,255,255,0.5)' : 'none',
            }}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
