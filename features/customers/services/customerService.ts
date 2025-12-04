
import { supabase } from '../../../services/supabaseClient';
import { Customer } from '../../../types';

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as Customer[];
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as Customer;
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as Customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};
