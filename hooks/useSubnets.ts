
import { useState, useCallback } from 'react';
import { Subnet } from '../types';
import { fetchSubnets, createSubnet, updateSubnet, deleteSubnet } from '../services/subnetService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useSubnets = () => {
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadSubnets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubnets();
      setSubnets(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load subnets", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSubnet = async (subnetData: Omit<Subnet, 'id' | 'created_at'>) => {
    try {
      const newSubnet = await createSubnet(subnetData);
      setSubnets(prev => [...prev, newSubnet].sort((a, b) => a.cidr.localeCompare(b.cidr)));
      return newSubnet;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editSubnet = async (id: string, updates: Partial<Subnet>) => {
    try {
      const updatedSubnet = await updateSubnet(id, updates);
      setSubnets(prev => prev.map(s => s.id === id ? updatedSubnet : s));
      return updatedSubnet;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeSubnet = async (id: string) => {
    try {
      await deleteSubnet(id);
      setSubnets(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    subnets,
    loading,
    error,
    loadSubnets,
    addSubnet,
    editSubnet,
    removeSubnet
  };
};
