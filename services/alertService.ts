
import { supabase } from './supabaseClient';
import { Alert } from '../types';

export const fetchAlerts = async (): Promise<Alert[]> => {
  const { data, error } = await supabase
    .from('network_alerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50); // Get last 50 alerts

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as Alert[];
};

export const createAlert = async (alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> => {
  const { data, error } = await supabase
    .from('network_alerts')
    .insert([alert])
    .select()
    .single();

  if (error) throw error;
  return data as Alert;
};
