
import { useState, useCallback } from 'react';
import { KnowledgeArticle } from '../types';
import { fetchArticles, createArticle, updateArticle, deleteArticle, incrementArticleViews } from '../services/kbService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useKnowledgeBase = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load KB articles", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addArticle = async (data: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
    try {
      const newArticle = await createArticle(data);
      setArticles(prev => [newArticle, ...prev]);
      return newArticle;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editArticle = async (id: string, updates: Partial<KnowledgeArticle>) => {
    try {
      const updated = await updateArticle(id, updates);
      setArticles(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const recordView = async (id: string) => {
      try {
          await incrementArticleViews(id);
          setArticles(prev => prev.map(a => a.id === id ? { ...a, views: (a.views || 0) + 1 } : a));
      } catch (err) {
          console.error("Failed to record view", err);
      }
  };

  return {
    articles,
    loading,
    error,
    loadArticles,
    addArticle,
    editArticle,
    removeArticle,
    recordView
  };
};
