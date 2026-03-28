"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProfile } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { GlassGauge } from '@/components/skeuomorphic/GlassGauge';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          praise_entries (*)
        `)
        .eq('id', id as string)
        .single();

      if (data) {
        setProduct(data);
      }
      setLoading(false);
    }
    
    fetchProduct();
  }, [id, router]);

  if (loading) {
    return <div style={{ padding: 'var(--space-4)', color: 'var(--color-brass)' }}>翻阅档案中... (Loading...)</div>;
  }

  if (!product) {
    return <div style={{ padding: 'var(--space-4)', color: '#d9534f' }}>未找到该物品 (Product not found)</div>;
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <header style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--color-wood-dark)', margin: 0 }}>
          {product.name}
        </h2>
        <BrassButton variant="ghost" onClick={() => router.back()}>返回 (Back)</BrassButton>
      </header>

      <LeatherCard style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'var(--color-wood-medium)', 
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden'
          }}>
             {product.image_url ? (
               <img src={product.image_url} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
             ) : (
               <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-wood-dark)'}}>
                 [暂无照片]
               </div>
             )}
          </div>
          
          <div style={{ flex: 1 }}>
             <p style={{ margin: '0 0 var(--space-2) 0', color: 'var(--color-brass)', fontFamily: 'var(--font-handwriting)', fontSize:'var(--text-lg)' }}>
               {product.category}
             </p>
             <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#aaa' }}>
               纳入收藏: {new Date(product.created_at).toLocaleDateString()}
             </p>
             <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--text-sm)', color: '#aaa' }}>
               状态: {product.condition || '未知'}
             </p>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)' }}>
           <h4 style={{ color: 'var(--color-gold)', marginBottom: 'var(--space-2)' }}>物性温度槽 (Love Gauge)</h4>
           {/* Assume 1 praise = 10 warmth points */}
           <GlassGauge value={(product.praise_entries?.length || 0) * 10} max={100} />
           <p style={{ textAlign: 'right', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0 0', color:'var(--color-brass)'}}>
             累计夸夸: {product.praise_entries?.length || 0} 次
           </p>
        </div>
      </LeatherCard>

      <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--color-wood-dark)', marginBottom: 'var(--space-4)' }}>
        历史记忆 (Memories)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {product.praise_entries?.map((entry: any) => (
          <div key={entry.id} className="texture-parchment" style={{ 
            padding: 'var(--space-4)', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-wood-medium)' 
          }}>
            <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: 'var(--text-lg)', margin: '0 0 var(--space-2) 0' }}>
              &quot;{entry.content}&quot;
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-wood-dark)', textAlign: 'right' }}>
              - {new Date(entry.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        
        {(!product.praise_entries || product.praise_entries.length === 0) && (
          <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
            这件物品还在等待被你发现它的闪光点...
          </p>
        )}
      </div>

    </div>
  );
}
