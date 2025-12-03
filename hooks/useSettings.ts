
import { useState, useCallback, useEffect } from 'react';
import { fetchSetting, updateSetting } from '../services/settingsService';

export const useSettings = () => {
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  // Load initial settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const savedCurrency = await fetchSetting('currency');
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
    } catch (err) {
      console.warn("Could not load settings from DB, using defaults.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveCurrency = async (newCurrency: string) => {
    try {
      // Optimistic update
      setCurrency(newCurrency);
      await updateSetting('currency', newCurrency, 'Default currency code');
    } catch (err) {
      // Revert on failure (could improve with previous state tracking)
      console.error("Failed to save currency setting");
      loadSettings(); 
      throw err;
    }
  };

  return {
    currency,
    loading,
    saveCurrency,
    loadSettings
  };
};
