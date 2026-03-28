import { createClient } from './client';

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

// --- Praise Entries ---
export async function addPraise(entry: {
  user_id: string;
  product_id: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from('praise_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
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
    .from('user_achievements')
    .select(`
      unlocked_at,
      achievements (
        name,
        description,
        icon_url,
        type
      )
    `)
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}
