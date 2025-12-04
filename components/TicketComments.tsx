
import React, { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { Activity, Send, User } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Flex } from './ui/flex';
import { useAuth } from '../contexts/AuthContext';

interface TicketCommentsProps {
  ticketId: string;
}

export const TicketComments: React.FC<TicketCommentsProps> = ({ ticketId }) => {
  const { comments, addComment } = useComments(ticketId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(newComment, currentUser?.name || 'User');
      setNewComment('');
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
      <CardHeader className="py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
         <Flex align="center" gap={2}>
             <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
             <h3 className="text-lg font-medium text-gray-900 dark:text-white m-0">Conversation & Updates</h3>
             <span className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold ml-2">
                {comments.length}
             </span>
         </Flex>
      </CardHeader>
      
      <CardContent className="p-6">
         {/* Comment Feed */}
         <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Activity className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-sm">No updates yet. Start the conversation below.</p>
               </div>
            ) : (
               comments.map((comment) => {
                  const isMe = comment.author_name === currentUser?.name;
                  const isSystem = comment.author_name === 'System';
                  
                  if (isSystem) {
                      return (
                          <div key={comment.id} className="flex justify-center my-4">
                              <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-600">
                                  {comment.content} • {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                      );
                  }

                  return (
                    <Flex key={comment.id} gap={3} align="start" className={isMe ? "flex-row-reverse" : ""}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${isMe ? 'bg-primary-100 text-primary-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                           {comment.author_name.charAt(0)}
                        </div>
                        
                        <div className={`max-w-[80%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{comment.author_name}</span>
                                <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe 
                                    ? "bg-primary-600 text-white rounded-tr-none" 
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                            }`}>
                                <p className="whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    </Flex>
                  );
               })
            )}
         </div>

         {/* Composer */}
         <div className="relative">
            <Textarea
                rows={3}
                className="w-full pr-12 resize-none bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                placeholder="Type your reply here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
            <div className="absolute bottom-3 right-3">
                <Button
                    onClick={handleSubmit}
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm"
                    disabled={!newComment.trim() || isSubmitting}
                    isLoading={isSubmitting}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right">Press Enter to send, Shift+Enter for new line</p>
         </div>
      </CardContent>
   </Card>
  );
};
