
import { supabase } from './supabaseClient';
import { AuditLog, AuditAction } from '../types';

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100); // Limit to last 100 entries for performance

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as AuditLog[];
};

export const logAction = async (
  action: AuditAction,
  entity: string,
  performedBy: string,
  entityId?: string,
  details?: string
): Promise<void> => {
  const { error } = await supabase
    .from('audit_logs')
    .insert([{
      action,
      entity,
      entity_id: entityId,
      details,
      performed_by: performedBy
    }]);

  if (error) {
    console.error("Failed to write audit log:", error);
    // We don't throw here to avoid breaking the main action flow if logging fails
  }
};
