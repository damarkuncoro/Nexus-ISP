
import { useState, useCallback, useEffect } from 'react';
import { NetworkDevice } from '../../../types';
import { fetchDevices, createDevice, updateDevice, deleteDevice } from '../services/deviceService';
import { getSafeErrorMessage } from '../../../utils/errorHelpers';
import { supabase } from '../../../services/supabaseClient';

export const useDevices = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      setError(err);
      // Don't crash main app load if just this table is missing
      console.warn("Failed to load network devices", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:network_devices')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'network_devices' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDevice = payload.new as NetworkDevice;
            setDevices((prev) => {
                if (prev.find(d => d.id === newDevice.id)) return prev;
                return [...prev, newDevice].sort((a, b) => a.name.localeCompare(b.name));
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedDevice = payload.new as NetworkDevice;
            setDevices((prev) =>
              prev.map((d) => (d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d))
            );
          } else if (payload.eventType === 'DELETE') {
            setDevices((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addDevice = async (deviceData: Omit<NetworkDevice, 'id' | 'created_at' | 'last_check'>) => {
    try {
      const newDevice = await createDevice(deviceData);
      // Realtime will handle the list update, but we do optimistic update here for speed
      setDevices(prev => {
          if (prev.find(d => d.id === newDevice.id)) return prev;
          return [...prev, newDevice];
      });
      return newDevice;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editDevice = async (id: string, updates: Partial<NetworkDevice>) => {
    try {
      const updatedDevice = await updateDevice(id, updates);
      // Realtime will handle update, but optimistic update prevents UI jitter
      setDevices(prev => prev.map(d => d.id === id ? updatedDevice : d));
      return updatedDevice;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeDevice = async (id: string) => {
    try {
      await deleteDevice(id);
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    devices,
    loading,
    error,
    loadDevices,
    addDevice,
    editDevice,
    removeDevice
  };
};
