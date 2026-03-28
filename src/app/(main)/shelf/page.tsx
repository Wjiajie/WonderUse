"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WoodenShelf } from '@/components/skeuomorphic/WoodenShelf';
import { MiaoWu } from '@/components/miaowu/MiaoWu';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { ParchmentInput } from '@/components/skeuomorphic/ParchmentInput';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  created_at: string;
}

/* 骨架屏物品占位 */
const SkeletonItem = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="skeleton"
    style={{
      width: '100px',
      height: '100px',
      borderRadius: 'var(--radius-md)',
      animationDelay: `${delay}ms`,
    }}
  />
);

/* 成功粒子特效 */
const SparkleEffect = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 900);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const dx = Math.cos((angle * Math.PI) / 180) * 50;
    const dy = Math.sin((angle * Math.PI) / 180) * 50 - 30;
    const colors = ['#DAA520', '#F5C842', '#CD7F32', '#E8C9A0', '#B8860B'];
    return { dx, dy, color: colors[i % colors.length], size: 4 + Math.random() * 4 };
  });

  return (
    <div style={{ position: 'fixed', top: '40%', left: '50%', zIndex: 9999, pointerEvents: 'none' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            animation: `sparkle-burst 0.8s ease-out forwards`,
            animationDelay: `${i * 30}ms`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          } as React.CSSProperties}
        />
      ))}
      {/* 文字庆祝 */}
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], y: -60, scale: 1 }}
        transition={{ duration: 0.8, times: [0, 0.2, 0.7, 1] }}
        style={{
          position: 'absolute',
          left: '-40px',
          fontFamily: 'var(--font-handwriting-stack)',
          fontSize: '1.1rem',
          color: '#F5C842',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}
      >
        ✨ 封入展架！
      </motion.div>
    </div>
  );
};

/* Empty State 组件 */
const EmptyShelfState = ({ onAdd }: { onAdd: () => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-8) var(--space-4)' }}>
    {/* 虚线框 — 第一件物品占位 */}
    <div
      style={{
        width: '100px',
        height: '100px',
        border: '2px dashed rgba(93,64,55,0.4)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(240,226,200,0.5)',
        marginBottom: 'var(--space-4)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onClick={onAdd}
      role="button"
      aria-label="添加第一件珍爱之物"
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-brass)';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(218,165,32,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(93,64,55,0.4)';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(240,226,200,0.5)';
      }}
    >
      {/* 问号装饰 */}
      <span style={{
        fontSize: '2rem',
        color: 'rgba(93,64,55,0.3)',
        fontFamily: 'var(--font-heading)',
        lineHeight: 1,
      }}>?</span>
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'rgba(93,64,55,0.4)',
        fontFamily: 'var(--font-handwriting-stack)',
        marginTop: 'var(--space-1)',
      }}>点击添加</span>
    </div>

    {/* 文案 */}
    <p style={{
      fontFamily: 'var(--font-handwriting-stack)',
      fontSize: 'var(--text-lg)',
      color: 'var(--color-wood-medium)',
      textAlign: 'center',
      lineHeight: 1.6,
      maxWidth: '240px',
    }}>
      展架还是空的，把你的第一件<br />
      <span style={{ color: 'var(--color-brass)', fontWeight: 700 }}>珍爱之物</span> 封入其中吧
    </p>
  </div>
);

export default function ShelfPage() {
  const [catState, setCatState] = useState<'idle' | 'happy' | 'curious' | 'surprised'>('idle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [streak, setStreak] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const nameInputRef = useRef<HTMLInputElement>(null);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 打开模态框时 auto-focus 输入框
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [showAddModal]);

  const handleAddItem = useCallback(async () => {
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
      setNewItemId(data.id);
      setCatState('happy');
      setShowSparkle(true);
      setTimeout(() => setCatState('idle'), 2500);
    } else if (error) {
      console.error('添加物品失败:', error);
    }
    setNewName('');
    setNewCategory('');
    setShowAddModal(false);
    setSubmitting(false);
  }, [newName, newCategory, supabase]);

  // ESC 关闭模态框
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ padding: 'var(--space-4)', paddingBottom: '90px' }}>
      {/* 粒子效果层 */}
      {showSparkle && (
        <SparkleEffect onComplete={() => setShowSparkle(false)} />
      )}

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-4)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-wood-dark)',
          margin: 0,
          fontSize: 'var(--text-2xl)',
          letterSpacing: '0.05em',
        }}>
          我的展架
        </h1>

        {/* 连续打卡徽章 */}
        <div
          className="streak-badge"
          aria-label={`连续打卡 ${streak} 天`}
          title="连续打卡天数"
        >
          <span>🔥</span>
          <span>{streak} 天</span>
        </div>
      </header>

      {/* 刻印分隔线 */}
      <hr className="engraved-divider" />

      {/* 吉祥物 — 小尺寸角落守护者 */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
        aria-label="妙物吉祥物"
      >
        <MiaoWu
          currentState={catState}
          size="medium"
          className={catState === 'idle' ? 'anim-breathe' : ''}
          onClick={() => {
            setCatState('curious');
            setTimeout(() => setCatState('idle'), 2000);
          }}
        />
      </section>

      {/* 展架区域 */}
      <section aria-label="物品展架">
        {loading ? (
          /* 骨架屏 */
          <WoodenShelf>
            {[0, 150, 300].map(delay => (
              <SkeletonItem key={delay} delay={delay} />
            ))}
          </WoodenShelf>
        ) : (
          <WoodenShelf>
            {/* 添加新物品按钮 */}
            <div
              id="add-item-btn"
              onClick={() => setShowAddModal(true)}
              style={{
                width: '100px', height: '100px',
                background: 'linear-gradient(135deg, rgba(240,226,200,0.9) 0%, rgba(220,198,160,0.7) 100%)',
                border: '2px dashed rgba(93,64,55,0.35)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-inset)',
                borderRadius: 'var(--radius-md)',
                transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-brass)';
                (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(218,165,32,0.12) 0%, rgba(240,226,200,0.7) 100%)';
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(93,64,55,0.35)';
                (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(240,226,200,0.9) 0%, rgba(220,198,160,0.7) 100%)';
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              }}
              role="button"
              aria-label="添加新物品"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowAddModal(true); }}
            >
              <span style={{
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-wood-medium)',
                lineHeight: 1,
                fontWeight: 300,
              }}>+</span>
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginTop: '4px',
                fontFamily: 'var(--font-handwriting-stack)',
              }}>封入物品</span>
            </div>

            {/* 物品列表 */}
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={product.id === newItemId ? { scale: 0, rotate: -10, opacity: 0 } : false}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: product.id === newItemId ? 0 : index * 0.05 }}
                  onClick={() => router.push(`/product/${product.id}`)}
                  style={{
                    width: '100px', height: '100px',
                    background: 'linear-gradient(145deg, var(--color-cream) 0%, var(--color-parchment) 100%)',
                    border: '1px solid rgba(93,64,55,0.2)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 'var(--space-2)',
                    boxShadow: 'var(--shadow-raised)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(62,39,35,0.2), 0 16px 32px rgba(62,39,35,0.1)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.97 }}
                  tabIndex={0}
                  role="button"
                  aria-label={`查看物品：${product.name}`}
                >
                  {/* 物品卡片光泽 */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    pointerEvents: 'none',
                  }} />
                  {/* 类别图标 — 用首字代替 emoji */}
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--color-wood-light), var(--color-wood-medium))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '6px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(62,39,35,0.2)',
                    color: 'rgba(255,248,231,0.9)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'bold',
                  }}>
                    {product.name[0]}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-wood-dark)',
                    fontWeight: 600,
                    wordBreak: 'break-all',
                    lineHeight: 1.2,
                    fontFamily: 'var(--font-heading)',
                    maxHeight: '2.4em',
                    overflow: 'hidden',
                  }}>
                    {product.name}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </WoodenShelf>
        )}

        {/* Empty State — 展架为空时显示 */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EmptyShelfState onAdd={() => setShowAddModal(true)} />
          </motion.div>
        )}
      </section>

      {/* 添加物品模态框 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(44,24,16,0.65)',
              backdropFilter: 'blur(6px)',
              padding: 'var(--space-4)',
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
            role="dialog"
            aria-modal="true"
            aria-label="添加新物品"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{ width: '100%', maxWidth: '360px' }}
            >
              <LeatherCard style={{
                padding: 'var(--space-6)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                border: '1px solid rgba(184,134,11,0.2)',
              }}>
                {/* 模态框标题 */}
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  color: '#F5C842',
                  fontSize: 'var(--text-xl)',
                  marginBottom: 'var(--space-1)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}>
                  封入展架
                </h2>
                <p style={{
                  fontFamily: 'var(--font-handwriting-stack)',
                  color: 'rgba(240,226,200,0.6)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--space-6)',
                  fontStyle: 'italic',
                }}>
                  为你的珍爱之物建立档案
                </p>

                <hr className="engraved-divider" style={{ margin: '0 0 var(--space-5) 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label
                      htmlFor="item-name-input"
                      style={{
                        display: 'block',
                        fontSize: 'var(--text-xs)',
                        color: 'rgba(218,165,32,0.7)',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      物品名称 *
                    </label>
                    <ParchmentInput
                      id="item-name-input"
                      ref={nameInputRef}
                      placeholder="例：祖母的旧相机  /  初恋的吉他"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="item-category-input"
                      style={{
                        display: 'block',
                        fontSize: 'var(--text-xs)',
                        color: 'rgba(218,165,32,0.7)',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      类别（可选）
                    </label>
                    <ParchmentInput
                      id="item-category-input"
                      placeholder="例：相机·摄影  /  乐器  /  书籍"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                    <BrassButton
                      variant="ghost"
                      onClick={() => setShowAddModal(false)}
                      style={{ minHeight: '44px' }}
                    >
                      取消
                    </BrassButton>
                    <BrassButton
                      id="submit-item-btn"
                      onClick={handleAddItem}
                      disabled={submitting || !newName.trim()}
                      style={{ minHeight: '44px' }}
                      aria-busy={submitting}
                    >
                      {submitting ? '封入中…' : '封入展架 ✦'}
                    </BrassButton>
                  </div>
                </div>
              </LeatherCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
