"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { ParchmentInput } from '@/components/skeuomorphic/ParchmentInput';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { motion } from 'framer-motion';

/* 装饰性 SVG 黄铜角花 */
const BrassCorner = ({ flip = false }: { flip?: boolean }) => (
  <svg
    width="40" height="40" viewBox="0 0 40 40"
    style={{ transform: flip ? 'scaleX(-1)' : 'none', opacity: 0.6 }}
    fill="none"
  >
    <path d="M4 4 Q4 36 36 36" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 4 Q4 20 20 20" stroke="#DAA520" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <circle cx="4" cy="4" r="2.5" fill="#DAA520"/>
    <circle cx="36" cy="36" r="2.5" fill="#DAA520"/>
    <circle cx="20" cy="20" r="1.5" fill="#DAA520" opacity="0.5"/>
  </svg>
);

/* 装饰性分隔线 */
const OrnamentalDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-6) 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(218,165,32,0.5))' }} />
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2 L11.5 8 L18 10 L11.5 12 L10 18 L8.5 12 L2 10 L8.5 8 Z" fill="#DAA520" opacity="0.7"/>
    </svg>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(218,165,32,0.5), transparent)' }} />
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        router.push('/shelf');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/shelf');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '认证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        /* 深色木质背景 + 光晕效果 */
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(180,120,60,0.25) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, rgba(93,64,55,0.2) 0%, transparent 50%),
          linear-gradient(160deg, #2C1A12 0%, #3E2723 40%, #4E342E 70%, #2C1A12 100%)
        `,
        /* SVG 噪点叠加 */
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
          radial-gradient(ellipse at 50% 0%, rgba(180,120,60,0.25) 0%, transparent 60%),
          linear-gradient(160deg, #2C1A12 0%, #3E2723 40%, #4E342E 70%, #2C1A12 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰光晕 */}
      <div style={{
        position: 'absolute',
        top: '15%', left: '50%',
        transform: 'translateX(-50%)',
        width: '300px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(218,165,32,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'glow-pulse 4s ease-in-out infinite',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.34, 1.06, 0.64, 1] }}
        style={{ width: '100%', maxWidth: '400px', position: 'relative' }}
      >
        <LeatherCard style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(184,134,11,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 皮革光泽叠加 */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* 角花装饰 */}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <BrassCorner />
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <BrassCorner flip />
          </div>

          {/* Logo 区域 */}
          <div style={{ position: 'relative', marginBottom: 0 }}>
            {/* 品牌 Logo */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-4xl)',
              color: '#F5C842',
              textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 30px rgba(218,165,32,0.35)',
              letterSpacing: '0.12em',
              lineHeight: 1.1,
              marginBottom: 'var(--space-1)',
            }}>
              妙物记
            </h1>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              color: 'rgba(218,165,32,0.7)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}>
              WonderUse
            </p>

            <OrnamentalDivider />

            {/* 品牌 Tagline */}
            <p style={{
              fontFamily: 'var(--font-handwriting-stack)',
              fontSize: 'var(--text-lg)',
              color: 'rgba(240,226,200,0.75)',
              lineHeight: 1.6,
              marginTop: 'calc(-1 * var(--space-2))',
              marginBottom: 'var(--space-6)',
              fontStyle: 'italic',
            }}>
              "发现你身边珍爱之物的魔法"
            </p>
          </div>

          {/* 表单区域 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left' }}>
            <div>
              <label
                htmlFor="login-email"
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
                信使邮箱
              </label>
              <ParchmentInput
                id="login-email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAuth(false); }}
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
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
                通行秘钥
              </label>
              <ParchmentInput
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAuth(false); }}
                autoComplete="current-password"
                aria-required="true"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  color: '#E57373',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-handwriting-stack)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'rgba(229,115,115,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(229,115,115,0.3)',
                }}
                role="alert"
              >
                ⚠️ {error}
              </motion.p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <BrassButton
                id="login-btn"
                style={{ flex: 1, minHeight: '44px' }}
                onClick={() => handleAuth(false)}
                disabled={loading || !email || !password}
                aria-busy={loading}
              >
                {loading ? '开启中…' : '开启书房'}
              </BrassButton>
              <BrassButton
                id="signup-btn"
                variant="secondary"
                style={{ flex: 1, minHeight: '44px' }}
                onClick={() => handleAuth(true)}
                disabled={loading || !email || !password}
              >
                登记访客
              </BrassButton>
            </div>
          </div>

          {/* 底部版权 */}
          <p style={{
            marginTop: 'var(--space-6)',
            fontSize: 'var(--text-xs)',
            color: 'rgba(240,226,200,0.3)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.05em',
          }}>
            © 妙物记 · 珍爱之物档案馆
          </p>
        </LeatherCard>
      </motion.div>
    </div>
  );
}
