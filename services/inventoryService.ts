
import { supabase } from './supabaseClient';
import { InventoryItem } from '../types';

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as InventoryItem[];
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'updated_at'>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
        ...updates,
        updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItem;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const adjustInventoryStock = async (id: string, quantityChange: number): Promise<void> => {
  // 1. Fetch current quantity
  const { data: item, error: fetchError } = await supabase
    .from('inventory_items')
    .select('quantity')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // 2. Calculate new quantity
  const newQuantity = (item?.quantity || 0) + quantityChange;

  // 3. Update
  const { error } = await supabase
    .from('inventory_items')
    .update({ 
        quantity: newQuantity, 
        updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) throw error;
};
