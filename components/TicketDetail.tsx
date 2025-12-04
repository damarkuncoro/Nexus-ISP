
import React, { useState } from 'react';
import { Ticket, TicketStatus, Employee, TicketPriority } from '../types';
import { ArrowLeft, Edit2, Trash2, User, MapPin, Calendar, Clock, Wifi, FileText, CheckSquare, AlertTriangle, Microscope } from 'lucide-react';
import { TicketStatusBadge, TicketPriorityBadge, TicketCategoryIcon } from './StatusBadges';
import { TicketComments } from './TicketComments';
import { EscalationModal } from './modals/EscalationModal';
import { TicketWorkflow } from './TicketWorkflow';
import { createComment } from '../services/commentService';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { useToast } from '../contexts/ToastContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
  onUpdateStatus: (id: string, updates: Partial<Ticket>) => Promise<void>;
  onDelete: (id: string) => void;
  onCustomerClick: (customerId: string) => void;
  employees?: Employee[];
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ 
  ticket, 
  onBack, 
  onEdit,
  onUpdateStatus,
  onDelete, 
  onCustomerClick,
  employees = []
}) => {
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const toast = useToast();

  const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED;

  const handleWorkflowUpdate = async (updates: Partial<Ticket>) => {
      await onUpdateStatus(ticket.id, updates);
  };

  const handleEscalationConfirm = async (reason: string, assignee: string) => {
      try {
          await createComment({
              ticket_id: ticket.id,
              content: `🚨 **TICKET ESCALATED**\n\n**Reason:** ${reason}\n${assignee ? `**Reassigned to:** ${assignee}` : ''}`,
              author_name: "System"
          });

          const updates: Partial<Ticket> = {
              is_escalated: true,
              priority: TicketPriority.HIGH,
          };
          if (assignee) {
              updates.assigned_to = assignee;
              updates.status = TicketStatus.ASSIGNED;
          }

          await onUpdateStatus(ticket.id, updates);
          toast.success("Ticket has been escalated.");
      } catch (error) {
          console.error("Escalation failed", error);
          toast.error("Failed to escalate ticket. Please try again.");
      }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 relative">
      
      <Flex direction="col" justify="between" gap={4} className="sm:flex-row sm:items-start pb-2">
        <Flex align="start" gap={4}>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onBack} 
            className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          
          <div>
             <Flex align="center" gap={3} className="mb-2">
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
                {ticket.is_escalated && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-600 text-white animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        ESCALATED
                    </span>
                )}
                <span className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">#{String(ticket.id).slice(0,8)}</span>
             </Flex>
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.title}</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created on {new Date(ticket.created_at).toLocaleString()}
             </p>
          </div>
        </Flex>
        
        <Flex gap={2} wrap="wrap" className="self-end sm:self-start">
           {!ticket.is_escalated && ticket.status !== TicketStatus.CLOSED && (
               <Button 
                variant="outline"
                onClick={() => setShowEscalationModal(true)}
                className="text-red-700 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900 dark:hover:bg-red-900/40"
               >
                 <AlertTriangle className="w-4 h-4 mr-2" />
                 Escalate
               </Button>
           )}
           <Button 
             variant="outline"
             onClick={() => onEdit(ticket)}
           >
             <Edit2 className="w-4 h-4 mr-2" />
             Edit Ticket
           </Button>
           
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the ticket
                    and remove all associated data and comments from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(ticket.id)} className="bg-red-600 hover:bg-red-700">
                    Delete Ticket
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
           </AlertDialog>
        </Flex>
      </Flex>

      <Separator />

      <Grid cols={1} className="lg:grid-cols-3" gap={6}>
        <GridItem className="lg:col-span-2 space-y-6">
           <TicketWorkflow 
             ticket={ticket} 
             employees={employees} 
             onUpdateStatus={handleWorkflowUpdate} 
           />

           <Card>
              <CardHeader className="py-4 flex flex-row items-center gap-2">
                 <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white m-0">Description</h3>
              </CardHeader>
              <CardContent>
                 <Flex gap={4}>
                    <TicketCategoryIcon category={ticket.category} />
                    <div className="prose prose-sm text-gray-600 dark:text-gray-300 max-w-none">
                       {ticket.description ? (
                         <p className="whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                       ) : (
                         <p className="text-gray-400 italic">No description provided.</p>
                       )}
                    </div>
                 </Flex>
              </CardContent>
           </Card>

           {(ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.VERIFIED || ticket.status === TicketStatus.CLOSED) && (
               <Grid cols={1} gap={6}>
                    <Card className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800">
                        <CardHeader className="py-4 border-green-100 dark:border-green-800 bg-transparent flex flex-row items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-green-700 dark:text-green-400" />
                                <h3 className="text-lg font-medium text-green-800 dark:text-green-300 m-0">Resolution</h3>
                        </CardHeader>
                        <CardContent className="text-green-900 dark:text-green-200">
                                {ticket.resolution_notes ? (
                                    <p className="whitespace-pre-wrap">{ticket.resolution_notes}</p>
                                ) : (
                                    <p className="italic text-green-700 dark:text-green-400">No resolution notes recorded.</p>
                                )}
                        </CardContent>
                    </Card>

                    {ticket.root_cause && (
                        <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800">
                             <CardHeader className="py-4 border-purple-100 dark:border-purple-800 bg-transparent flex flex-row items-center gap-2">
                                     <Microscope className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                                     <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 m-0">Root Cause Analysis (RCA)</h3>
                             </CardHeader>
                             <CardContent className="text-purple-900 dark:text-purple-200">
                                 <p className="whitespace-pre-wrap">{ticket.root_cause}</p>
                             </CardContent>
                        </Card>
                    )}
               </Grid>
           )}

           <TicketComments ticketId={ticket.id} />
        </GridItem>

        <GridItem className="space-y-6">
           <Card>
               <CardHeader className="py-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white m-0">Ticket Info</h3>
               </CardHeader>
               <CardContent className="space-y-4">
                   <div>
                       <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Agent</span>
                       <Flex align="center" gap={2} className="mt-1">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ticket.assigned_to ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-gray-300'}`}>
                               {ticket.assigned_to ? ticket.assigned_to.charAt(0) : '?'}
                           </div>
                           <p className={`text-sm font-medium ${ticket.assigned_to ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 italic'}`}>
                               {ticket.assigned_to || 'Unassigned'}
                           </p>
                       </Flex>
                   </div>
                   
                   <div>
                       <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date (SLA)</span>
                       <Flex align="center" gap={2} className="mt-1">
                           <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                           <p className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : ticket.due_date ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 italic'}`}>
                               {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'No Deadline'}
                           </p>
                           {isOverdue && <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">OVERDUE</span>}
                       </Flex>
                   </div>

                   <div>
                     <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</span>
                     <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-200 capitalize">{ticket.category ? ticket.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Uncategorized'}</p>
                  </div>
               </CardContent>
           </Card>

           <Card>
              <CardHeader className="py-4 flex flex-row items-center gap-2">
                 <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white m-0">Subscriber</h3>
              </CardHeader>
              <CardContent>
              {ticket.customer ? (
                <div>
                  <Flex align="center" gap={3} className="mb-4">
                     <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300 flex items-center justify-center font-bold">
                        {ticket.customer.name.charAt(0)}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{ticket.customer.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.customer.email}</p>
                     </div>
                  </Flex>
                  
                  <div className="space-y-3 text-sm">
                     {ticket.customer.address && (
                       <Flex align="start" gap={2} className="text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{ticket.customer.address}</span>
                       </Flex>
                     )}
                     {ticket.customer.subscription_plan && (
                       <Flex align="center" gap={2} className="text-gray-600 dark:text-gray-300">
                          <Wifi className="w-4 h-4 text-gray-400" />
                          <span>{ticket.customer.subscription_plan}</span>
                       </Flex>
                     )}
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => ticket.customer?.id && onCustomerClick(ticket.customer.id)}
                    className="mt-6 w-full"
                  >
                    View Subscriber Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm italic">
                   No customer linked to this ticket.
                </div>
              )}
              </CardContent>
           </Card>
        </GridItem>
      </Grid>

      {showEscalationModal && (
        <EscalationModal
            isOpen={showEscalationModal}
            onClose={() => setShowEscalationModal(false)}
            ticket={ticket}
            employees={employees}
            onConfirm={handleEscalationConfirm}
        />
      )}
    </div>
  );
};
