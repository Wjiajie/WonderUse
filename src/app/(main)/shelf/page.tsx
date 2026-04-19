"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/skeuomorphic/ProductCard';
import { CategoryTabBar, TabId } from '@/components/skeuomorphic/CategoryTabBar';
import { MiaoWu } from '@/components/miaowu/MiaoWu';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { AddProductModal } from '@/components/skeuomorphic/AddProductModal';
import { createClient } from '@/utils/supabase/client';
import { uploadProductImage } from '@/utils/supabase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/ToastProvider';
import { PullToRefresh } from '@/components/ui/PullToRefresh';

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
    className="skeleton shelf-item-placeholder"
    style={{
      animationDelay: `${delay}ms`,
      marginBottom: '4px'
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



export default function ShelfPage() {
  const [catState, setCatState] = useState<'idle' | 'happy' | 'curious' | 'surprised'>('idle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const filteredProducts = products.filter(p => activeTab === 'all' || p.category === activeTab);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setUserEmail(user.email ?? '');

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

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    showToast('已退出登录', 'success');
    router.push('/login');
  };

  const handleAddItemSubmit = async (data: {
    name: string;
    category: string;
    brand?: string;
    purchased_at?: string;
    description?: string;
    imageFile?: File | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    let imageUrl = null;
    if (data.imageFile) {
      imageUrl = await uploadProductImage(user.id, data.imageFile);
    }

    const { data: insertedData, error } = await supabase
      .from('products')
      .insert({ 
        user_id: user.id, 
        name: data.name.trim(), 
        category: data.category,
        brand: data.brand?.trim() || null,
        purchased_at: data.purchased_at || null,
        description: data.description?.trim() || null,
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) {
      console.error('添加物品失败详情:', error.message, error.details, error.hint, error);
      throw new Error(`添加物品失败: ${error.message || JSON.stringify(error)}`);
    }

    if (insertedData) {
      setProducts(prev => [insertedData, ...prev]);
      setNewItemId(insertedData.id);
      setCatState('happy');
      setShowSparkle(true);
      setTimeout(() => setCatState('idle'), 2500);
    }
  };

  const refreshData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: prods }, { data: streakData }] = await Promise.all([
      supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
    ]);
    setProducts(prods || []);
    setStreak(streakData?.current_streak ?? 0);
  }, [supabase]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '70px' }}>
      {/* 粒子效果层 */}
      {showSparkle && (
        <SparkleEffect onComplete={() => setShowSparkle(false)} />
      )}

      <PullToRefresh onRefresh={refreshData} threshold={70}>
        <div style={{ padding: 'var(--space-4)' }}>
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

        {/* 右侧工具栏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* 连续打卡徽章 */}
          <div
            className="streak-badge"
            aria-label={`连续打卡 ${streak} 天`}
            title="连续打卡天数"
          >
            <span>🔥</span>
            <span>{streak} 天</span>
          </div>

          {/* 用户下拉菜单 */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              aria-label="用户菜单"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              style={{
                background: 'rgba(218,165,32,0.15)',
                border: '1px solid rgba(218,165,32,0.3)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-brass)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail.split('@')[0]}
              </span>
              <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    minWidth: '140px',
                    background: 'var(--color-parchment)',
                    border: '1px solid rgba(218,165,32,0.3)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-raised)',
                    overflow: 'hidden',
                    zIndex: 200,
                  }}
                >
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-handwriting-stack)',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(192,57,43,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>🚪</span>
                    <span>退出登录</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      <section aria-label="物品展架" className="px-4">
        <div className="mb-6 mt-2">
          <CategoryTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {loading ? (
          /* 骨架屏 */
          <div className="cabinet-container w-full">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="cubby-hole">
                <SkeletonItem delay={idx * 150} />
              </div>
            ))}
          </div>
        ) : (
          <div className="cabinet-container w-full">
            {/* 固定的“封入物品”底座（放在第一个格子） */}
            <div className="cubby-hole">
              <div className="cubby-bottom" />
              <div
                className="add-item-pedestal"
                onClick={() => setShowAddModal(true)}
                role="button"
                tabIndex={0}
                aria-label="添加新物品"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowAddModal(true); }}
              >
                <span className="add-item-icon">+</span>
                <span className="add-item-text">封入物品</span>
              </div>
            </div>

            {/* 渲染物品 */}
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="cubby-hole">
                  <div className="cubby-bottom" />
                  <ProductCard 
                    product={product} 
                    index={index} 
                    onClick={() => router.push(`/product/${product.id}`)} 
                  />
                </div>
              ))}
            </AnimatePresence>

            {/* 空槽补全逻辑：保证总格子数至少为12，且是4的倍数 */}
            {(() => {
              const totalOccupied = filteredProducts.length + 1; // 1 for the add button
              const targetTotal = Math.max(12, Math.ceil(totalOccupied / 4) * 4);
              const emptyCount = targetTotal - totalOccupied;
              
              return Array.from({ length: emptyCount }).map((_, idx) => (
                <div key={`empty-${idx}`} className="cubby-hole">
                  <div className="cubby-bottom" />
                </div>
              ));
            })()}
          </div>
        )}

        {/* Empty State — 当选定分类下无物品时显示 */}
        {!loading && filteredProducts.length === 0 && products.length > 0 && (
           <div className="text-center py-10 text-[#5d4037]/60 font-handwriting mt-8 text-lg">
             该分类下还没有珍爱之物哦~
           </div>
        )}
      </section>
        </div>
      </PullToRefresh>

      {/* 添加物品模态框 */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItemSubmit}
      />
    </div>
  );
}
