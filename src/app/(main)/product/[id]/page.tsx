"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { deleteProduct } from '@/utils/supabase/queries';
import { useToast } from '@/components/ui/ToastProvider';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { GlassGauge } from '@/components/skeuomorphic/GlassGauge';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';

const MOOD_LABELS: Record<string, string> = {
  happy: '😊 开心',
  surprised: '😲 惊喜',
  grateful: '🙏 感恩',
  proud: '😌 自豪',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('products')
        .select(`*, praise_entries(*)`)
        .eq('id', id as string)
        .single();

      if (data) {
        // Sort praise entries newest first
        if (data.praise_entries) {
          data.praise_entries.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      showToast(`「${product.name}」已从展架移除`, 'success');
      router.push('/shelf');
    } catch {
      showToast('移除失败，请稍后再试', 'error');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: '180px', marginBottom: 'var(--space-6)' }} />
        <div className="skeleton" style={{ height: '120px', marginBottom: 'var(--space-3)' }} />
        <div className="skeleton" style={{ height: '120px' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 'var(--space-4)', textAlign: 'center', paddingTop: '30%' }}>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-handwriting-stack)' }}>
          未找到该物品，它可能已离开展架。
        </p>
        <BrassButton onClick={() => router.push('/shelf')} style={{ marginTop: 'var(--space-4)' }}>
          返回展架
        </BrassButton>
      </div>
    );
  }

  const praiseCount = product.praise_entries?.length ?? 0;
  const lovePercent = Math.min(100, praiseCount * 10);

  return (
    <div style={{ padding: 'var(--space-4)', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-5)',
      }}>
        <BrassButton variant="ghost" onClick={() => router.back()}
          style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-sm)' }}>
          ← 返回
        </BrassButton>
        <h2 style={{
          fontFamily: 'var(--font-heading)', color: 'var(--color-wood-dark)',
          margin: 0, fontSize: 'var(--text-lg)',
          flex: 1, textAlign: 'center',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          padding: '0 var(--space-2)',
        }}>
          {product.name}
        </h2>
        <button
          id="delete-product-btn"
          onClick={() => setShowDeleteModal(true)}
          title="移除此物品"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontSize: '1.1rem',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#C0392B')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          🗑
        </button>
      </header>

      {/* 物品卡 */}
      <LeatherCard style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {/* 图片区 */}
          <div style={{
            width: '96px', height: '96px', flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(218,165,32,0.3)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '2.5rem' }}>📦</span>
            }
          </div>

          {/* 信息区 */}
          <div style={{ flex: 1 }}>
            <p style={{
              margin: '0 0 var(--space-1) 0',
              color: 'var(--color-gold-on-leather)',
              fontFamily: 'var(--font-handwriting-stack)',
              fontSize: 'var(--text-lg)',
            }}>
              {product.category}
            </p>
            {product.brand && (
              <p style={{ margin: '0 0 var(--space-1) 0', color: 'rgba(240,221,184,0.6)', fontSize: 'var(--text-sm)' }}>
                {product.brand}
              </p>
            )}
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'rgba(240,221,184,0.5)' }}>
              纳入收藏: {product.purchased_at
                ? new Date(product.purchased_at).toLocaleDateString()
                : new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* 热爱值仪表 */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)' }}>
              物性温度槽
            </h4>
            <span style={{ color: 'var(--color-gold)', fontSize: 'var(--text-sm)' }}>
              ✦ {praiseCount} 次夸赞
            </span>
          </div>
          <GlassGauge value={lovePercent} max={100} />
        </div>
      </LeatherCard>

      {/* 回忆时间线 */}
      <h3 style={{
        fontFamily: 'var(--font-heading)', color: 'var(--color-wood-dark)',
        marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)',
      }}>
        封印回忆 · 时间线
      </h3>

      {praiseCount === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <p style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-handwriting-stack)',
            lineHeight: 1.6,
          }}>
            这件物品还在等待被发现它的闪光点...<br />
            去「每日夸夸」为它写下第一条记忆吧！
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* 黄铜竖线 */}
          <div style={{
            position: 'absolute',
            left: '12px', top: '12px',
            bottom: '12px',
            width: '2px',
            background: 'linear-gradient(to bottom, var(--color-gold), var(--color-wood-medium))',
            borderRadius: '1px',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {product.praise_entries.map((entry: any, i: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ position: 'relative' }}
              >
                {/* 节点圆点 */}
                <div style={{
                  position: 'absolute',
                  left: '-26px', top: '14px',
                  width: '10px', height: '10px',
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--color-gold)' : 'var(--color-brass)',
                  border: '2px solid var(--color-parchment)',
                  boxShadow: i === 0 ? '0 0 8px rgba(218,165,32,0.5)' : 'none',
                }} />

                <div className="texture-parchment" style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(93,64,55,0.2)',
                  boxShadow: 'var(--shadow-raised)',
                }}>
                  {/* 元信息行 */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 'var(--space-2)',
                  }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-handwriting-stack)' }}>
                      {new Date(entry.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                    </span>
                    {entry.mood && (
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        background: 'rgba(184,134,11,0.12)',
                        color: 'var(--color-brass)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid rgba(184,134,11,0.25)',
                      }}>
                        {MOOD_LABELS[entry.mood] ?? entry.mood}
                      </span>
                    )}
                  </div>

                  {/* 引导问题 */}
                  {entry.prompt_used && (
                    <p style={{
                      margin: '0 0 var(--space-1) 0',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'italic',
                    }}>
                      💬 {entry.prompt_used}
                    </p>
                  )}

                  {/* 夸赞内容 */}
                  <blockquote style={{
                    margin: 0,
                    fontFamily: 'var(--font-handwriting-stack)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.7,
                    borderLeft: '3px solid var(--color-brass)',
                    paddingLeft: 'var(--space-3)',
                  }}>
                    {entry.content}
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 删除确认 Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(28,14,6,0.75)',
              zIndex: 1000,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: 'var(--space-6)',
                background: 'var(--color-parchment)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                boxShadow: '0 -8px 32px rgba(62,39,35,0.3)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem' }}>😲</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-wood-dark)', margin: 'var(--space-2) 0' }}>
                  确认移除「{product.name}」？
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                  此操作将删除该物品及其所有 {praiseCount} 条夸赞记忆，<strong>无法恢复</strong>。
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <BrassButton
                  id="confirm-delete-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: 'linear-gradient(135deg, #C0392B, #96281B)',
                    borderColor: '#96281B',
                    color: 'white',
                  }}
                >
                  {deleting ? '移除中...' : '确认移除此物品'}
                </BrassButton>
                <BrassButton variant="ghost" onClick={() => setShowDeleteModal(false)}>
                  再想想，先不删
                </BrassButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
