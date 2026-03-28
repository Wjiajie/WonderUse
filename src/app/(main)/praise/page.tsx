"use client";

import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { ParchmentTextArea } from '@/components/skeuomorphic/ParchmentInput';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { MiaoWu } from '@/components/miaowu/MiaoWu';

export default function PraisePage() {
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      
      <header style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <MiaoWu currentState="happy" size="small" />
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--color-wood-dark)', margin: 0 }}>每日夸夸</h2>
      </header>

      <LeatherCard style={{ padding: 'var(--space-4)' }}>
        <h3 style={{ fontFamily: 'var(--font-handwriting)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
          今天哪件物品帮助了你？
        </h3>
        
        {/* Placeholder for Item Selection */}
        <div style={{ 
          padding: 'var(--space-3)', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          border: '1px solid var(--color-brass)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-brass)',
          textAlign: 'center'
        }}>
          点击选择物品 (Select Item)
        </div>

        <ParchmentTextArea 
          placeholder="亲爱的日记，这件物品今天真是帮大忙了..."
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <BrassButton>封印记忆 (Save)</BrassButton>
        </div>
      </LeatherCard>
    </div>
  );
}
