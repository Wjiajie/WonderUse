"use client";

import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { WoodenShelf } from '@/components/skeuomorphic/WoodenShelf';

export default function AchievementsPage() {
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--color-wood-dark)', margin: 0 }}>荣誉殿堂</h2>
      </header>

      <LeatherCard style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-3xl)' }}>🔥</div>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', color: 'var(--color-gold)' }}>打卡连续纪元</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: 'var(--text-sm)' }}>已连续发现物品价值 0 天</p>
          </div>
        </div>
      </LeatherCard>

      <WoodenShelf>
        <div style={{ width: '100%', textAlign: 'center', color: 'var(--color-wood-medium)', padding: 'var(--space-4) 0' }}>
           尚未解锁成就徽章
        </div>
      </WoodenShelf>
    </div>
  );
}
