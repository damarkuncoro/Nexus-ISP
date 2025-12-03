
import { supabase } from './supabaseClient';
import { TicketCategoryConfig } from '../types';

export const fetchCategories = async (): Promise<TicketCategoryConfig[]> => {
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    // If the table doesn't exist yet, return empty (setup required)
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as TicketCategoryConfig[];
};

export const createCategory = async (category: Omit<TicketCategoryConfig, 'id' | 'created_at'>): Promise<TicketCategoryConfig> => {
  const { data, error } = await supabase
    .from('ticket_categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data as TicketCategoryConfig;
};

export const updateCategory = async (id: string, updates: Partial<TicketCategoryConfig>): Promise<TicketCategoryConfig> => {
  const { data, error } = await supabase
    .from('ticket_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TicketCategoryConfig;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ticket_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const seedDefaultCategories = async (): Promise<void> => {
  const defaults = [
    { name: 'Internet Issue', code: 'internet_issue', sla_hours: 4, description: 'Connectivity problems, slow speeds, packet loss.' },
    { name: 'Billing', code: 'billing', sla_hours: 24, description: 'Invoice inquiries, payment issues, plan changes.' },
    { name: 'Hardware', code: 'hardware', sla_hours: 48, description: 'Router malfunction, cable breaks, equipment replacement.' },
    { name: 'Installation', code: 'installation', sla_hours: 72, description: 'New service setup, moving services.' },
    { name: 'Other', code: 'other', sla_hours: 24, description: 'General inquiries and feedback.' }
  ];

  const { error } = await supabase
    .from('ticket_categories')
    .upsert(defaults, { onConflict: 'code', ignoreDuplicates: true });

  if (error) throw error;
};
