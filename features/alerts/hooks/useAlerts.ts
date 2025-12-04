
import { useState, useCallback } from 'react';
import { Alert } from '../../../types';
import { fetchAlerts, createAlert } from '../services/alertService';
import { getSafeErrorMessage } from '../../../utils/errorHelpers';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerAlert = async (alertData: Omit<Alert, 'id' | 'created_at'>) => {
    try {
        const newAlert = await createAlert(alertData);
        setAlerts(prev => [newAlert, ...prev]);
        return newAlert;
    } catch (err) {
        throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    alerts,
    loading,
    error,
    loadAlerts,
    triggerAlert
  };
};
