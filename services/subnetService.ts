
import { supabase } from './supabaseClient';
import { Subnet } from '../types';

export const fetchSubnets = async (): Promise<Subnet[]> => {
  const { data, error } = await supabase
    .from('subnets')
    .select('*')
    .order('cidr', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as Subnet[];
};

export const createSubnet = async (subnet: Omit<Subnet, 'id' | 'created_at'>): Promise<Subnet> => {
  const { data, error } = await supabase
    .from('subnets')
    .insert([subnet])
    .select()
    .single();

  if (error) throw error;
  return data as Subnet;
};

export const updateSubnet = async (id: string, updates: Partial<Subnet>): Promise<Subnet> => {
  const { data, error } = await supabase
    .from('subnets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Subnet;
};

export const deleteSubnet = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subnets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
