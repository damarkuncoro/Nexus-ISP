
import { useState, useCallback } from 'react';
import { Department } from '../types';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../services/departmentService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDepartment = async (deptData: Omit<Department, 'id' | 'created_at'>) => {
    try {
      const newDept = await createDepartment(deptData);
      setDepartments(prev => [...prev, newDept].sort((a, b) => a.name.localeCompare(b.name)));
      return newDept;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const updatedDept = await updateDepartment(id, updates);
      setDepartments(prev => prev.map(d => d.id === id ? updatedDept : d));
      return updatedDept;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeDepartment = async (id: string) => {
    try {
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    departments,
    loading,
    error,
    loadDepartments,
    addDepartment,
    editDepartment,
    removeDepartment
  };
};
