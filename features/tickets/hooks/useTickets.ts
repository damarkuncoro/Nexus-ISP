
import { useState, useCallback, useEffect } from 'react';
import { Ticket, AuditAction } from '../../../types';
import { fetchTickets, createTicket, updateTicket, deleteTicket, fetchTicket } from '../services/ticketService';
import { logAction } from '../../../services/auditService';
import { getSafeErrorMessage } from '../../../utils/errorHelpers';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabaseClient';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { currentUser } = useAuth();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTicket = await fetchTicket(payload.new.id);
            if (newTicket) {
              setTickets((prev) => {
                if (prev.find((t) => t.id === newTicket.id)) return prev;
                return [newTicket, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTicket = await fetchTicket(payload.new.id);
            if (updatedTicket) {
              setTickets((prev) =>
                prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at' | 'customer'>) => {
    try {
      const newTicket = await createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      
      if (currentUser) {
        await logAction(AuditAction.CREATE, 'Ticket', currentUser.name, newTicket.id, `Created ticket: ${newTicket.title}`);
      }

      return newTicket;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const updatedTicket = await updateTicket(id, updates);
      setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      
      if (currentUser) {
        let details = 'Updated ticket details';
        if (updates.status) details = `Changed status to ${updates.status.toUpperCase()}`;
        if (updates.assigned_to) details = `Assigned to ${updates.assigned_to}`;
        
        await logAction(AuditAction.UPDATE, 'Ticket', currentUser.name, id, details);
      }

      return updatedTicket;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeTicket = async (id: string) => {
    try {
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      
      if (currentUser) {
        await logAction(AuditAction.DELETE, 'Ticket', currentUser.name, id, `Deleted ticket`);
      }
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    tickets,
    loading,
    error,
    loadTickets,
    addTicket,
    editTicket,
    removeTicket,
    setTickets
  };
};
