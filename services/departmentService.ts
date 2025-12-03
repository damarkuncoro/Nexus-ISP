
import { supabase } from './supabaseClient';
import { Department } from '../types';

export const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as Department[];
};

export const createDepartment = async (department: Omit<Department, 'id' | 'created_at'>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select()
    .single();

  if (error) throw error;
  return data as Department;
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Department;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
