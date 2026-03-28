import { SupabaseClient } from '@supabase/supabase-js';

export interface AchievementDef {
  type: string;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  { type: 'first_praise',   title: '初识之喜',    description: '完成第一次夸赞',       emoji: '🌱' },
  { type: 'streak_7',       title: '七日之约',    description: '连续打卡 7 天',        emoji: '🎀' },
  { type: 'streak_30',      title: '月度挚友',    description: '连续打卡 30 天',       emoji: '🎩' },
  { type: 'products_5',     title: '小小收藏家',  description: '添加 5 件产品',        emoji: '🗝️' },
  { type: 'products_20',    title: '宝物猎人',    description: '添加 20 件产品',       emoji: '🏺' },
  { type: 'praise_10',      title: '赞美达人',    description: '累计 10 条夸赞',       emoji: '✨' },
  { type: 'praise_50',      title: '热爱大师',    description: '累计 50 条夸赞',       emoji: '👑' },
  { type: 'all_categories', title: '全品类探索者', description: '4 个分类都有产品',    emoji: '🗺️' },
];

interface Stats {
  totalPraises: number;
  currentStreak: number;
  totalProducts: number;
  categories: string[];
}

async function getStats(userId: string, supabase: SupabaseClient): Promise<Stats> {
  const [praiseRes, streakRes, productsRes] = await Promise.all([
    supabase.from('praise_entries').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('streaks').select('current_streak').eq('user_id', userId).single(),
    supabase.from('products').select('category').eq('user_id', userId),
  ]);

  const totalPraises = praiseRes.count ?? 0;
  const currentStreak = streakRes.data?.current_streak ?? 0;
  const totalProducts = productsRes.data?.length ?? 0;
  const categories = [...new Set((productsRes.data ?? []).map((p: { category: string }) => p.category))];

  return { totalPraises, currentStreak, totalProducts, categories };
}

function checkCondition(def: AchievementDef, stats: Stats): boolean {
  switch (def.type) {
    case 'first_praise':   return stats.totalPraises >= 1;
    case 'streak_7':       return stats.currentStreak >= 7;
    case 'streak_30':      return stats.currentStreak >= 30;
    case 'products_5':     return stats.totalProducts >= 5;
    case 'products_20':    return stats.totalProducts >= 20;
    case 'praise_10':      return stats.totalPraises >= 10;
    case 'praise_50':      return stats.totalPraises >= 50;
    case 'all_categories': return stats.categories.length >= 4;
    default:               return false;
  }
}

/**
 * Check achievement conditions and insert newly qualified achievements.
 * Returns the list of newly unlocked achievements.
 */
export async function checkAndUnlockAchievements(
  userId: string,
  supabase: SupabaseClient
): Promise<AchievementDef[]> {
  const [stats, existingRes] = await Promise.all([
    getStats(userId, supabase),
    supabase.from('achievements').select('achievement_type').eq('user_id', userId),
  ]);

  const existingTypes = new Set((existingRes.data ?? []).map((a: { achievement_type: string }) => a.achievement_type));
  const newlyUnlocked: AchievementDef[] = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (!existingTypes.has(def.type) && checkCondition(def, stats)) {
      const { error } = await supabase.from('achievements').insert({
        user_id: userId,
        achievement_type: def.type,
        title: def.title,
        description: def.description,
        icon: def.emoji,
      });
      if (!error) {
        newlyUnlocked.push(def);
      }
    }
  }

  return newlyUnlocked;
}
