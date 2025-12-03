
import { supabase } from './supabaseClient';

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

export const fetchSetting = async (key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    // If table missing or key missing, return null
    if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST116') return null;
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }
  return data?.value || null;
};

export const updateSetting = async (key: string, value: string, description?: string): Promise<void> => {
  const { error } = await supabase
    .from('system_settings')
    .upsert({ 
        key, 
        value, 
        description,
        updated_at: new Date().toISOString()
    })
    .select();

  if (error) throw error;
};
