"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BrassTabBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: '展架', path: '/shelf', icon: '📝' },
    { name: '夸夸', path: '/praise', icon: '✨' },
    { name: '成就', path: '/achievements', icon: '🏅' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.5)'
    }} className="texture-brass">
      {navItems.map(item => {
        const isActive = pathname.startsWith(item.path);
        
        return (
          <Link 
            key={item.path} 
            href={item.path}
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              padding: 'var(--space-2) 0',
              opacity: isActive ? 1 : 0.6,
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease',
              color: 'var(--color-wood-dark)',
              textShadow: isActive ? '0 1px 0 rgba(255,255,255,0.8)' : 'none',
              fontWeight: isActive ? 'bold' : 'normal'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{item.icon}</span>
            <span style={{ fontSize: '0.75rem' }}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
