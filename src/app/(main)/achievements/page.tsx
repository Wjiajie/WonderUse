"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { getUserAchievements, getStreak, getPraiseCount } from '@/utils/supabase/queries';
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements';
import { MetalBadge } from '@/components/skeuomorphic/MetalBadge';
import { LeatherCard } from '@/components/skeuomorphic/LeatherCard';
import { MiaoWu } from '@/components/miaowu/MiaoWu';

interface AchievementRow {
  achievement_type: string;
  title: string;
  icon: string;
  unlocked_at: string;
}

export default function AchievementsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [praiseCount, setPraiseCount] = useState(0);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, AchievementRow>>({});

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const [achievements, streakRes, count] = await Promise.all([
        getUserAchievements(user.id),
        getStreak(user.id),
        getPraiseCount(user.id),
      ]);

      const map: Record<string, AchievementRow> = {};
      (achievements as AchievementRow[]).forEach(a => {
        map[a.achievement_type] = a;
      });

      setUnlockedMap(map);
      setCurrentStreak(streakRes.data?.current_streak ?? 0);
      setLongestStreak(streakRes.data?.longest_streak ?? 0);
      setPraiseCount(count);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-4)', paddingTop: '40%', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '120px', marginBottom: 'var(--space-4)' }} />
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  const unlockedCount = Object.keys(unlockedMap).length;

  return (
    <div style={{ padding: 'var(--space-4)', paddingBottom: '90px' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-wood-dark)', margin: 0 }}>
          荣誉殿堂
        </h2>
        <MiaoWu
          currentState={unlockedCount > 0 ? 'happy' : 'idle'}
          size="small"
        />
      </header>

      {/* 打卡连续纪元 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <LeatherCard style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔥</div>
            <div>
              <h3 style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-gold-on-leather)',
                fontSize: 'var(--text-xl)',
              }}>
                打卡连续纪元
              </h3>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(240,221,184,0.7)', fontSize: 'var(--text-sm)' }}>
                已连续发现物品价值 <strong style={{ color: 'var(--color-gold)' }}>{currentStreak}</strong> 天
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            borderTop: '1px solid rgba(218,165,32,0.2)',
            paddingTop: 'var(--space-3)',
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--color-gold)', fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)' }}>
                {longestStreak}
              </p>
              <p style={{ margin: 0, color: 'rgba(240,221,184,0.6)', fontSize: 'var(--text-xs)' }}>历史最长 (天)</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(218,165,32,0.2)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--color-gold)', fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)' }}>
                {praiseCount}
              </p>
              <p style={{ margin: 0, color: 'rgba(240,221,184,0.6)', fontSize: 'var(--text-xs)' }}>累计夸赞 (次)</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(218,165,32,0.2)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--color-gold)', fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)' }}>
                {unlockedCount}
              </p>
              <p style={{ margin: 0, color: 'rgba(240,221,184,0.6)', fontSize: 'var(--text-xs)' }}>成就解锁</p>
            </div>
          </div>
        </LeatherCard>
      </motion.div>

      {/* 成就勋章墙 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-wood-dark)',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--text-lg)',
        }}>
          勋章陈列柜 ({unlockedCount}/{ACHIEVEMENT_DEFINITIONS.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'rgba(62,39,35,0.06)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(93,64,55,0.15)',
          boxShadow: 'var(--shadow-inset)',
        }}>
          {ACHIEVEMENT_DEFINITIONS.map((def, i) => {
            const row = unlockedMap[def.type];
            return (
              <motion.div
                key={def.type}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 + i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
              >
                <MetalBadge
                  emoji={def.emoji}
                  title={def.title}
                  description={def.description}
                  unlockedAt={row?.unlocked_at}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 空成就引导 */}
      {unlockedCount === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-handwriting-stack)',
            marginTop: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
          }}
        >
          完成你的第一次夸夸，开启成就之旅！🌱
        </motion.p>
      )}
    </div>
  );
}
