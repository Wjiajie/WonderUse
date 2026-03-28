import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Update streak after a praise submission.
 * - Same day as last_praise_date: no-op (already counted)
 * - Yesterday: streak + 1
 * - Before yesterday: reset to 1
 * All date comparisons use UTC dates.
 */
export async function updateStreak(userId: string, supabase: SupabaseClient): Promise<void> {
  const todayUTC = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const { data: streak, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !streak) return;

  // Already counted today
  if (streak.last_praise_date === todayUTC) return;

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newStreak = streak.last_praise_date === yesterdayStr
    ? (streak.current_streak ?? 0) + 1
    : 1;

  const newLongest = Math.max(streak.longest_streak ?? 0, newStreak);

  await supabase.from('streaks').update({
    current_streak: newStreak,
    longest_streak: newLongest,
    last_praise_date: todayUTC,
  }).eq('user_id', userId);
}
