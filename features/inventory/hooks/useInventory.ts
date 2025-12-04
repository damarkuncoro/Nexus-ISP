
import { useState, useCallback } from 'react';
import { InventoryItem } from '../../../types';
import { fetchInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, adjustInventoryStock } from '../services/inventoryService';
import { getSafeErrorMessage } from '../../../utils/errorHelpers';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInventory();
      setItems(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (itemData: Omit<InventoryItem, 'id' | 'updated_at'>) => {
    try {
      const newItem = await createInventoryItem(itemData);
      setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
      return newItem;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
      return updatedItem;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const adjustStock = async (id: string, delta: number) => {
    try {
      await adjustInventoryStock(id, delta);
      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, quantity: i.quantity + delta } : i
      ));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    items,
    loading,
    error,
    loadInventory,
    addItem,
    editItem,
    removeItem,
    adjustStock
  };
};
