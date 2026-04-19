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



export default function ShelfPage() {
  const [catState, setCatState] = useState<'idle' | 'happy' | 'curious' | 'surprised'>('idle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const router = useRouter();

  const filteredProducts = products.filter(p => activeTab === 'all' || p.category === activeTab);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      console.error('添加物品失败:', error);
      throw error;
    }

    if (insertedData) {
      setProducts(prev => [insertedData, ...prev]);
      setNewItemId(insertedData.id);
      setCatState('happy');
      setShowSparkle(true);
      setTimeout(() => setCatState('idle'), 2500);
    }
  };

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
      <section aria-label="物品展架" className="px-4">
        <div className="mb-6 mt-2">
          <CategoryTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {loading ? (
          /* 骨架屏 */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[0, 150, 300].map(delay => (
              <SkeletonItem key={delay} delay={delay} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* 添加新物品按钮 */}
            <div
              id="add-item-btn"
              onClick={() => setShowAddModal(true)}
              className="texture-parchment relative w-full h-[180px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#5d4037]/30 cursor-pointer hover:border-[#b8860b] hover:bg-[#f0e2c8]/80 transition-all duration-300"
              role="button"
              aria-label="添加新物品"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowAddModal(true); }}
            >
              <span className="text-4xl text-[#5d4037]/40 font-light mb-1">+</span>
              <span className="text-sm text-[#5d4037]/60 font-heading">封入物品</span>
            </div>

            {/* 物品列表 */}
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  onClick={() => router.push(`/product/${product.id}`)} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State — 当选定分类下无物品时显示 */}
        {!loading && filteredProducts.length === 0 && products.length > 0 && (
           <div className="text-center py-10 text-[#5d4037]/60 font-handwriting mt-8 text-lg">
             该分类下还没有珍爱之物哦~
           </div>
        )}
      </section>

      {/* 添加物品模态框 */}
      <AddProductModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddItemSubmit} 
      />
    </div>
  );
}
