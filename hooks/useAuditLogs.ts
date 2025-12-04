
import { useState, useCallback } from 'react';
import { AuditLog } from '../types';
import { fetchAuditLogs, fetchAuditLogsByEntity } from '../services/auditService';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogsByEntity = useCallback(async (entity: string, entityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogsByEntity(entity, entityId);
      setLogs(data);
    } catch (err) {
      setError(err);
      console.warn(`Failed to load audit logs for ${entity}`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    logs,
    loading,
    error,
    loadLogs,
    loadLogsByEntity
  };
};
