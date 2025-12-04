
import { useState, useCallback, useEffect } from 'react';
import { TicketComment } from '../types';
import { fetchComments, createComment } from '../services/commentService';
import { getSafeErrorMessage } from '../utils/errorHelpers';
import { supabase } from '../services/supabaseClient';

export const useComments = (ticketId: string) => {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(ticketId);
      setComments(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadComments();

    if (!ticketId) return;

    // Subscribe to new comments for this ticket
    const channel = supabase
      .channel(`comments:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          const newComment = payload.new as TicketComment;
          setComments((prev) => {
             // Deduplicate in case of race condition with local optimistic update
             if (prev.some(c => c.id === newComment.id)) return prev;
             return [...prev, newComment];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, loadComments]);

  const addComment = async (content: string, authorName: string = 'Support Agent') => {
    try {
      const newComment = await createComment({
        ticket_id: ticketId,
        content,
        author_name: authorName
      });
      // Optimistic update
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    comments,
    loading,
    error,
    loadComments,
    addComment
  };
};
