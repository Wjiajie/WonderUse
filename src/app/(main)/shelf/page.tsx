"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WoodenShelf } from '@/components/skeuomorphic/WoodenShelf';
import { MiaoWu } from '@/components/miaowu/MiaoWu';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { ParchmentInput } from '@/components/skeuomorphic/ParchmentInput';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { createClient } from '@/utils/supabase/client';

interface Product {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  created_at: string;
}

export default function ShelfPage() {
  const [catState, setCatState] = useState<'idle' | 'happy' | 'curious' | 'surprised'>('idle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [streak, setStreak] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setProducts(prods || []);

      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();
      setStreak(streakData?.current_streak || 0);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleAddItem = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .insert({ user_id: user.id, name: newName.trim(), category: newCategory.trim() || '未分类' })
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => [data, ...prev]);
      setCatState('happy');
      setTimeout(() => setCatState('idle'), 2000);
    }
    setNewName('');
    setNewCategory('');
    setShowAddModal(false);
    setSubmitting(false);
  };

  return (
    <div style={{ padding: 'var(--space-4)', paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--color-wood-dark)', margin: 0 }}>我的展架</h2>
        <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-leather)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-obj)', color: 'var(--color-gold)' }}>
          🔥 {streak}
        </div>
      </header>

      {/* Mascot */}
      <section style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
        <MiaoWu
          currentState={catState}
          size="large"
          onClick={() => {
            setCatState('curious');
            setTimeout(() => setCatState('idle'), 2000);
          }}
        />
      </section>

      {/* Shelves */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <WoodenShelf>
          {/* Add new item button */}
          <div
            id="add-item-btn"
            onClick={() => setShowAddModal(true)}
            style={{
              width: '100px', height: '100px',
              background: 'var(--color-parchment)',
              border: '2px dashed var(--color-wood-medium)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-inset)',
              borderRadius: 'var(--radius-sm)',
              transition: 'opacity 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            role="button"
            aria-label="添加物品"
          >
            <span style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-wood-medium)', lineHeight: 1 }}>+</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-wood-medium)', marginTop: '4px' }}>添加物品</span>
          </div>

          {/* Existing products */}
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => router.push(`/product/${product.id}`)}
              style={{
                width: '100px', height: '100px',
                background: 'var(--color-parchment)',
                border: '1px solid var(--color-wood-medium)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 'var(--space-2)',
                boxShadow: 'var(--shadow-raised)',
                transition: 'transform 0.15s',
                textAlign: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <span style={{ fontSize: '28px', marginBottom: '4px' }}>📦</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-wood-dark)', fontWeight: 600, wordBreak: 'break-all', lineHeight: 1.2 }}>
                {product.name}
              </span>
            </div>
          ))}
        </WoodenShelf>

        {products.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>
            展架空空如也，点击 + 添加你的第一件珍爱之物 ✨
          </p>
        )}
      </section>

      {/* Add Item Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <LeatherCard style={{ padding: 'var(--space-6)', width: '320px', maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--color-gold)', marginBottom: 'var(--space-4)', margin: '0 0 var(--space-4) 0' }}>
              📦 登记珍爱之物
            </h3>

            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-wood-dark)', marginBottom: 'var(--space-1)', fontFamily: 'var(--font-handwriting)' }}>
                物品名称 *
              </label>
              <ParchmentInput
                id="item-name-input"
                placeholder="例：祖母的旧相机"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-wood-dark)', marginBottom: 'var(--space-1)', fontFamily: 'var(--font-handwriting)' }}>
                物品类别
              </label>
              <ParchmentInput
                id="item-category-input"
                placeholder="例：相机·摄影 / 书籍"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <BrassButton variant="ghost" onClick={() => setShowAddModal(false)}>
                取消
              </BrassButton>
              <BrassButton id="submit-item-btn" onClick={handleAddItem} disabled={submitting || !newName.trim()}>
                {submitting ? '登记中...' : '封入展架 ✨'}
              </BrassButton>
            </div>
          </LeatherCard>
        </div>
      )}
    </div>
  );
}
