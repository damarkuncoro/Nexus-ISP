
import { supabase } from './supabaseClient';
import { KnowledgeArticle } from '../types';

export const fetchArticles = async (): Promise<KnowledgeArticle[]> => {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as KnowledgeArticle[];
};

export const createArticle = async (article: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<KnowledgeArticle> => {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .insert([article])
    .select()
    .single();

  if (error) throw error;
  return data as KnowledgeArticle;
};

export const updateArticle = async (id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as KnowledgeArticle;
};

export const deleteArticle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('knowledge_articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const incrementArticleViews = async (id: string): Promise<void> => {
  // Use RPC if available for atomic increment, but for now simple update is okay for simulation
  const { data } = await supabase.from('knowledge_articles').select('views').eq('id', id).single();
  if (data) {
      await supabase.from('knowledge_articles').update({ views: (data.views || 0) + 1 }).eq('id', id);
  }
};
