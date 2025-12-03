import React, { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { Activity, Send } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Flex } from './ui/flex';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface TicketCommentsProps {
  ticketId: string;
}

export const TicketComments: React.FC<TicketCommentsProps> = ({ ticketId }) => {
  const { comments, addComment } = useComments(ticketId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="py-4 flex flex-row items-center gap-2">
         <Activity className="w-5 h-5 text-gray-500" />
         <h3 className="text-lg font-medium text-gray-900 m-0">Updates & Comments</h3>
         <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
            {comments.length}
         </span>
      </CardHeader>
      
      <CardContent className="space-y-6">
         {/* Comment List */}
         <div className="space-y-6">
            {comments.length === 0 ? (
               <div className="text-center py-6 text-gray-500 text-sm italic border-b border-gray-100 pb-8">
                  No updates yet. Start the conversation below.
               </div>
            ) : (
               comments.map((comment) => (
                  <Flex key={comment.id} gap={3} align="start" className="group">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${comment.author_name}`} alt={comment.author_name} />
                        <AvatarFallback>{comment.author_name.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 space-y-1">
                        <Flex align="center" justify="between">
                           <h4 className="text-sm font-bold text-gray-900">{comment.author_name}</h4>
                           <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                        </Flex>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg rounded-tl-none">
                           {comment.content}
                        </div>
                     </div>
                  </Flex>
               ))
            )}
         </div>

         {/* New Comment Form */}
         <Flex as="form" onSubmit={handleSubmit} gap={3} align="start" className="mt-6">
            <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.pravatar.cc/40?u=Admin" alt="Admin" />
                <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative space-y-2">
               <Textarea
                  rows={2}
                  className="min-h-[80px]"
                  placeholder="Add an update or internal note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
               />
               <Flex justify="end">
                  <Button
                     type="submit"
                     size="sm"
                     disabled={!newComment.trim() || isSubmitting}
                     isLoading={isSubmitting}
                  >
                     <Send className="w-3 h-3 mr-1.5" />
                     Post Update
                  </Button>
               </Flex>
            </div>
         </Flex>
      </CardContent>
   </Card>
  );
};
