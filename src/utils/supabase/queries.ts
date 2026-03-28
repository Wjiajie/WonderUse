import { createClient } from './client';
import { SupabaseClient } from '@supabase/supabase-js';

// NOTE: This module-level client is fine for browser-only usage.
// Server components should use the server client from ./server instead.
const supabase = createClient();

// --- Profiles ---
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// --- Products ---
export async function getProducts(userId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addProduct(product: {
  user_id: string;
  name: string;
  category: string;
  description?: string;
  purchase_date?: string;
  purchase_price?: number;
  condition?: string;
  image_url?: string;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) throw error;
}

// --- Praise Entries ---
export async function addPraise(entry: {
  user_id: string;
  product_id: string;
  content: string;
  mood?: string;
  prompt_used?: string;
}, client?: SupabaseClient) {
  const db = client ?? supabase;
  const { data, error } = await db
    .from('praise_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get today's praise entry for the user (UTC date).
 * Returns null if not yet praised today.
 */
export async function getTodayPraise(userId: string) {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('praise_entries')
    .select('*, products(name, category)')
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

// --- Streaks & Achievements ---
export async function getStreak(userId: string) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPraiseCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('praise_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}
