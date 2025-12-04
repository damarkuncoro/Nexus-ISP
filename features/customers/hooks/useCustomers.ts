
import { useState, useCallback } from 'react';
import { Customer, AuditAction } from '../../../types';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerService';
import { logAction } from '../../../services/auditService';
import { getSafeErrorMessage } from '../../../utils/errorHelpers';
import { useAuth } from '../../../contexts/AuthContext';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { currentUser } = useAuth();

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
      
      if (currentUser) {
        await logAction(AuditAction.CREATE, 'Customer', currentUser.name, newCustomer.id, `Registered new customer: ${newCustomer.name}`);
      }
      
      return newCustomer;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updatedCustomer = await updateCustomer(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      
      if (currentUser) {
        const changes = Object.keys(updates).join(', ');
        await logAction(AuditAction.UPDATE, 'Customer', currentUser.name, id, `Updated: ${changes}`);
      }

      return updatedCustomer;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      const customerName = customers.find(c => c.id === id)?.name || 'Unknown';
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      if (currentUser) {
        await logAction(AuditAction.DELETE, 'Customer', currentUser.name, id, `Deleted customer: ${customerName}`);
      }
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
