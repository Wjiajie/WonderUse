"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { getTodayPraise } from '@/utils/supabase/queries';
import { updateStreak } from '@/lib/streaks';
import { checkAndUnlockAchievements } from '@/lib/achievements';
import { useToast } from '@/components/ui/ToastProvider';
import { MiaoWu } from '@/components/miaowu/MiaoWu';
import { SpeechBubble } from '@/components/miaowu/SpeechBubble';
import { MoodPicker, type Mood } from '@/components/skeuomorphic/MoodPicker';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { ParchmentTextArea } from '@/components/skeuomorphic/ParchmentInput';

type PraiseState = 'loading' | 'no_products' | 'idle' | 'writing' | 'submitting' | 'done_today';

interface Product {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  love_score?: number;
}

const GUIDE_QUESTIONS = [
  "说说这件宝贝最近让你开心的一件事？",
  "这件产品有什么功能是你最常用但没想过的？",
  "如果要向朋友推荐它，你会怎么描述？",
  "它在哪个时刻让你觉得「还好买了它」？",
  "用了这么久，你发现了什么隐藏技巧吗？",
  "回想一下，它在什么关键时刻帮到了你？",
  "如果给它打个分，你会给几分？为什么？",
];

export default function PraisePage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [pageState, setPageState] = useState<PraiseState>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [guideQuestion, setGuideQuestion] = useState('');
  const [mood, setMood] = useState<Mood>('happy'); // default to happy, user can change
  const [content, setContent] = useState('');
  const [catState, setCatState] = useState<'idle' | 'happy' | 'curious' | 'surprised'>('idle');
  const [catSpeech, setCatSpeech] = useState('');
  const [todayEntry, setTodayEntry] = useState<any>(null);

  const randomQuestion = useCallback(() => {
    return GUIDE_QUESTIONS[Math.floor(Math.random() * GUIDE_QUESTIONS.length)];
  }, []);

  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const [prods, today] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        getTodayPraise(user.id),
      ]);

      if (today) {
        setTodayEntry(today);
        setPageState('done_today');
        return;
      }

      const productList = prods.data ?? [];
      if (productList.length === 0) {
        setPageState('no_products');
        return;
      }

      setProducts(productList);
      // 随机选一件
      const randomPick = productList[Math.floor(Math.random() * productList.length)];
      setSelectedProduct(randomPick);
      setGuideQuestion(randomQuestion());
      setPageState('idle');
      setCatSpeech('喵~ 今天想夸夸哪件宝贝？');
    }
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartWriting = () => {
    setPageState('writing');
    setCatState('curious');
    setCatSpeech('认真想想，说说它的闪光点吧～');
  };

  const handleSwitchProduct = () => {
    const others = products.filter(p => p.id !== selectedProduct?.id);
    if (others.length === 0) return;
    const next = others[Math.floor(Math.random() * others.length)];
    setSelectedProduct(next);
    setGuideQuestion(randomQuestion());
  };

  const handleSubmit = async () => {
    if (!selectedProduct || content.trim().length < 10) return;
    setPageState('submitting');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 1. Insert praise entry
      await supabase.from('praise_entries').insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        content: content.trim(),
        mood: mood,
        prompt_used: guideQuestion,
      });

      // 2. Update streak
      await updateStreak(user.id, supabase);

      // 3. Check achievements
      const newAchievements = await checkAndUnlockAchievements(user.id, supabase);

      // 4. Toast feedback
      showToast(`封印成功！「${selectedProduct.name}」热爱值 +1 ✦`, 'success');
      for (const ach of newAchievements) {
        showToast(`🏆 成就解锁：${ach.title}`, 'achievement');
      }

      // 5. Cat reaction
      setCatState('happy');
      setCatSpeech('已封入展架！喵~ 它一定很高兴被发现～');

      setPageState('done_today');
    } catch {
      showToast('出了点问题，请稍后再试', 'error');
      setPageState('writing');
    }
  };

  const charCount = content.trim().length;
  const canSubmit = charCount >= 10 && !!selectedProduct;

  // ── 渲染各状态 ──

  if (pageState === 'loading') {
    return (
      <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'center', paddingTop: '40%' }}>
        <span style={{ color: 'var(--color-brass)', fontFamily: 'var(--font-handwriting-stack)' }}>
          翻阅宝贝档案中...
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-4)', paddingBottom: '90px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <MiaoWu currentState={catState} size="small"
            onClick={() => { setCatState('curious'); setTimeout(() => setCatState('idle'), 2000); }}
          />
          {catSpeech && (
            <div style={{ position: 'absolute', top: '-8px', left: '70px', zIndex: 10, width: '180px' }}>
              <SpeechBubble text={catSpeech} position="left" visible={!!catSpeech} />
            </div>
          )}
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-wood-dark)', margin: 0 }}>
          每日夸夸
        </h2>
      </header>

      <AnimatePresence mode="wait">
        {/* 无物品空态 */}
        {pageState === 'no_products' && (
          <motion.div key="no-products"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <LeatherCard style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📦</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold-on-leather)', marginBottom: 'var(--space-2)' }}>
                展架还是空的～
              </h3>
              <p style={{ color: 'rgba(240,221,184,0.8)', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-handwriting-stack)' }}>
                先去添加你的第一件珍爱之物，才能开始夸夸哦！
              </p>
              <BrassButton onClick={() => router.push('/shelf')}>去添加妙物 →</BrassButton>
            </LeatherCard>
          </motion.div>
        )}

        {/* 今日已完成 */}
        {pageState === 'done_today' && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <LeatherCard style={{ padding: 'var(--space-6)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '2.5rem' }}>✦</span>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-gold-on-leather)',
                  marginTop: 'var(--space-2)',
                  marginBottom: 'var(--space-3)',
                }}>
                  今天的夸赞已封印
                </h3>
              </div>

              {todayEntry && (
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  marginBottom: 'var(--space-4)',
                  borderLeft: '3px solid var(--color-gold)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-handwriting-stack)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-parchment)',
                    margin: 0,
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    "{todayEntry.content}"
                  </p>
                  {todayEntry.products && (
                    <p style={{ margin: 'var(--space-2) 0 0 0', color: 'var(--color-gold)', fontSize: 'var(--text-xs)' }}>
                      — 关于「{todayEntry.products.name}」
                    </p>
                  )}
                </div>
              )}

              <p style={{ textAlign: 'center', color: 'rgba(240,221,184,0.7)', fontFamily: 'var(--font-handwriting-stack)', marginBottom: 'var(--space-4)' }}>
                明天再来发现新的惊喜吧～
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BrassButton variant="ghost" onClick={() => {
                  // Allow praising another item today
                  setTodayEntry(null);
                  setContent('');
                  setMood('happy');
                  setPageState(products.length > 0 ? 'idle' : 'no_products');
                  setCatSpeech('');
                }}>
                  随时可以再夸一件
                </BrassButton>
              </div>
            </LeatherCard>
          </motion.div>
        )}

        {/* 选择物品 + 开始写 */}
        {(pageState === 'idle' || pageState === 'writing' || pageState === 'submitting') && selectedProduct && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* 选中物品卡 */}
            <LeatherCard style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '52px', height: '52px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(218,165,32,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem',
                }}>
                  {selectedProduct.image_url
                    ? <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    : '📦'
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--color-gold-on-leather)', fontSize: 'var(--text-lg)' }}>
                    {selectedProduct.name}
                  </p>
                  <p style={{ margin: 0, color: 'rgba(240,221,184,0.6)', fontSize: 'var(--text-xs)' }}>
                    {selectedProduct.category}
                  </p>
                </div>
                {products.length > 1 && (
                  <BrassButton variant="ghost" onClick={handleSwitchProduct}
                    style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
                    换一件 →
                  </BrassButton>
                )}
              </div>
            </LeatherCard>

            {/* 物品横向选择器（idle 状态显示） */}
            {pageState === 'idle' && products.length > 1 && (
              <div style={{
                display: 'flex', gap: 'var(--space-2)', overflowX: 'auto',
                paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)',
                scrollbarWidth: 'none',
              }}>
                {products.map(p => (
                  <button key={p.id} onClick={() => setSelectedProduct(p)} style={{
                    flexShrink: 0, width: '80px', height: '80px',
                    background: selectedProduct?.id === p.id ? 'rgba(218,165,32,0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedProduct?.id === p.id ? '2px solid var(--color-gold)' : '1px solid rgba(218,165,32,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '4px', padding: 'var(--space-1)',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📦</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-parchment)', lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {pageState === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <BrassButton onClick={handleStartWriting} style={{ padding: 'var(--space-3) var(--space-8)' }}>
                  开始夸夸这件宝贝 ✦
                </BrassButton>
              </div>
            )}

            {/* 写作表单 */}
            {(pageState === 'writing' || pageState === 'submitting') && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {/* 引导问题 */}
                <LeatherCard style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)', background: 'rgba(0,0,0,0.1)' }}>
                  <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-handwriting-stack)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-gold-on-leather)',
                    lineHeight: 1.5,
                  }}>
                    💬 {guideQuestion}
                  </p>
                </LeatherCard>

                {/* 心情标签 */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontFamily: 'var(--font-handwriting-stack)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    此刻的心情
                    <span style={{ color: 'var(--color-gold-readable)', fontSize: 'var(--text-xs)' }}>（点击选择）</span>
                  </p>
                  <MoodPicker value={mood || 'happy'} onChange={setMood} />
                </div>

                {/* 文本输入 */}
                <div style={{ marginBottom: 'var(--space-4)', position: 'relative' }}>
                  <ParchmentTextArea
                    placeholder="亲爱的日记，这件物品今天真是帮大忙了..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={5}
                    style={{ width: '100%' }}
                  />
                  <div style={{
                    textAlign: 'right',
                    marginTop: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-handwriting-stack)',
                    color: charCount >= 10 ? 'var(--color-cat-eye)' : 'var(--color-text-muted)',
                    transition: 'color 0.3s',
                  }}>
                    {charCount} 字{charCount < 10 ? `（还需 ${10 - charCount} 字）` : ' ✓'}
                  </div>
                </div>

                <BrassButton
                  id="submit-praise-btn"
                  onClick={handleSubmit}
                  disabled={!canSubmit || pageState === 'submitting'}
                  style={{ width: '100%', padding: 'var(--space-3)' }}
                >
                  {pageState === 'submitting' ? '封印中...' : '封印记忆 ✦'}
                </BrassButton>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
