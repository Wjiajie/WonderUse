"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { ParchmentInput } from '@/components/skeuomorphic/ParchmentInput';
import { BrassButton } from '@/components/skeuomorphic/BrassButton';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('注册成功，请在进入前等待数据库准备响应（MVP 直接跳转）。');
        router.push('/shelf');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push('/shelf');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
    }} className="texture-wood">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <LeatherCard style={{ 
          padding: 'var(--space-6)', 
          textAlign: 'center',
          boxShadow: 'var(--shadow-heavy)'
        }}>
          <h1 style={{ 
            fontFamily: 'var(--font-title)', 
            color: 'var(--color-gold)', 
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--text-2xl)'
          }}>
            妙物记<br/><span style={{ fontSize: 'var(--text-lg)' }}>WonderUse</span>
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <ParchmentInput 
              type="email" 
              placeholder="信使邮箱 (Email)" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <ParchmentInput 
              type="password" 
              placeholder="通行秘钥 (Password)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p style={{ color: '#d9534f', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <BrassButton 
                style={{ flex: 1 }} 
                onClick={() => handleAuth(false)}
                disabled={loading}
              >
                {loading ? '开启中...' : '开启书房 (Login)'}
              </BrassButton>
              <BrassButton 
                variant="secondary" 
                style={{ flex: 1 }} 
                onClick={() => handleAuth(true)}
                disabled={loading}
              >
                登记访客 (Sign Up)
              </BrassButton>
            </div>
          </div>
        </LeatherCard>
      </motion.div>
    </div>
  );
}
