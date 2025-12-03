import { useState, useCallback } from 'react';
import { Customer } from '../types';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const newCustomer = await createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)));
      return newCustomer;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updatedCustomer = await updateCustomer(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    customers,
    loading,
    error,
    loadCustomers,
    addCustomer,
    editCustomer,
    removeCustomer
  };
};