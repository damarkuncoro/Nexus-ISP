
import { supabase } from '../../../services/supabaseClient';
import { Ticket } from '../../../types';

export const fetchTickets = async (): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, customer:customers(*)')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === 'PGRST200' || error.code === '42703' || error.message?.includes('relationship')) {
      console.warn("Relationship lookup failed, fetching tickets without customer data.");
      const { data: simpleData, error: simpleError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (simpleError) throw simpleError;
      return simpleData as Ticket[];
    }
    throw error;
  }
  return data as Ticket[];
};

export const fetchTicket = async (id: string): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
        const { data: simpleData } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
        return simpleData as Ticket;
    }
    return null;
  }
  return data as Ticket;
};

export const createTicket = async (ticket: Omit<Ticket, 'id' | 'created_at' | 'customer'>): Promise<Ticket> => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([ticket])
    .select('*, customer:customers(*)')
    .single();

  if (error) {
    if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
       const { data: simpleData, error: simpleError } = await supabase
        .from('tickets')
        .insert([ticket])
        .select()
        .single();
        
       if (simpleError) throw simpleError;
       return simpleData as Ticket;
    }
    throw error;
  }
  return data as Ticket;
};

export const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
  const { customer, ...cleanUpdates } = updates;
  
  const { data, error } = await supabase
    .from('tickets')
    .update(cleanUpdates)
    .eq('id', id)
    .select('*, customer:customers(*)')
    .single();

  if (error) {
     if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
       const { data: simpleData, error: simpleError } = await supabase
        .from('tickets')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
        
       if (simpleError) throw simpleError;
       return simpleData as Ticket;
     }
    throw error;
  }
  return data as Ticket;
};

export const deleteTicket = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};
