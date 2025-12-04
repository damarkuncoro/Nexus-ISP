
import React, { useState } from 'react';
import { Ticket, TicketStatus, Employee, TicketPriority, EmployeeRole } from '../types';
import { ArrowLeft, Edit2, Trash2, User, MapPin, Calendar, Clock, Wifi, FileText, CheckSquare, AlertTriangle, Microscope, MessageSquare, MoreVertical, Phone, Mail, Shield, Timer } from 'lucide-react';
import { TicketStatusBadge, TicketPriorityBadge, TicketCategoryBadge } from './StatusBadges';
import { TicketComments } from './TicketComments';
import { EscalationModal } from './modals/EscalationModal';
import { TicketWorkflow } from './TicketWorkflow';
import { SmartTicketAssist } from './SmartTicketAssist';
import { createComment } from '../services/commentService';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { Badge } from './ui/badge';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  const [isSendingWA, setIsSendingWA] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();

  const isCustomer = currentUser?.role === EmployeeRole.CUSTOMER;
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

  const handleWhatsAppUpdate = () => {
      setIsSendingWA(true);
      const message = `Hello ${ticket.customer?.name || 'Customer'}. Regarding ticket #${ticket.id.slice(0,6)}: ${ticket.title}. The current status is: ${ticket.status.toUpperCase()}. We are working on it.`;
      const encodedMsg = encodeURIComponent(message);
      const phone = ticket.customer?.phone?.replace(/\D/g, '') || '';
      
      setTimeout(() => {
          setIsSendingWA(false);
          if (phone) {
              window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
              toast.success("WhatsApp opened.");
          } else {
              toast.error("Customer has no phone number.");
          }
      }, 800);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* --- Header Section --- */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 sticky top-16 z-10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto">
            <Flex justify="between" align="start" className="mb-4">
                <Button 
                    variant="ghost" 
                    onClick={onBack} 
                    className="pl-0 hover:bg-transparent hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 dark:text-gray-400"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
                </Button>
                
                <Flex gap={2}>
                    {!isCustomer && (
                        <>
                            <Button 
                                variant="outline" 
                                className="hidden sm:flex text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/20" 
                                onClick={handleWhatsAppUpdate} 
                                isLoading={isSendingWA}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(ticket)}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit Ticket
                                    </DropdownMenuItem>
                                    {!ticket.is_escalated && ticket.status !== TicketStatus.CLOSED && (
                                        <DropdownMenuItem onClick={() => setShowEscalationModal(true)} className="text-amber-600 focus:text-amber-700">
                                            <AlertTriangle className="w-4 h-4 mr-2" /> Escalate
                                        </DropdownMenuItem>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Ticket
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(ticket.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </Flex>
            </Flex>

            <Flex align="start" justify="between" className="flex-col md:flex-row gap-4">
                <div>
                    <Flex align="center" gap={3} className="mb-2">
                        <span className="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">#{ticket.id.slice(0,8)}</span>
                        <TicketStatusBadge status={ticket.status} />
                        <TicketPriorityBadge priority={ticket.priority} />
                        {ticket.is_escalated && <Badge variant="destructive" className="animate-pulse">ESCALATED</Badge>}
                    </Flex>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{ticket.title}</h1>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created on</p>
                    <Flex align="center" justify="end" gap={2} className="text-gray-900 dark:text-gray-200 font-medium">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(ticket.created_at).toLocaleString()}
                    </Flex>
                </div>
            </Flex>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <Grid cols={1} className="lg:grid-cols-3" gap={8}>
            
            {/* --- LEFT COLUMN (Main Content) --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Workflow Stepper */}
                <div className={isCustomer ? "pointer-events-none opacity-90" : ""}>
                    <TicketWorkflow 
                        ticket={ticket} 
                        employees={employees} 
                        onUpdateStatus={handleWorkflowUpdate} 
                    />
                </div>

                {/* Description Card */}
                <Card className="shadow-sm border-t-4 border-t-blue-500">
                    <CardHeader className="border-b border-gray-100 dark:border-slate-700 py-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Issue Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="hidden sm:block">
                                <TicketCategoryBadge category={ticket.category} />
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {ticket.description || <span className="text-gray-400 italic">No description provided.</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resolution & RCA (Conditional) */}
                {(ticket.resolution_notes || ticket.root_cause) && (
                    <div className="space-y-6">
                        {ticket.resolution_notes && (
                            <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5" /> Resolution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">{ticket.resolution_notes}</p>
                                </CardContent>
                            </Card>
                        )}
                        {!isCustomer && ticket.root_cause && (
                            <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-purple-800 dark:text-purple-400 flex items-center gap-2">
                                        <Microscope className="w-5 h-5" /> Root Cause Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-purple-900 dark:text-purple-200 whitespace-pre-wrap">{ticket.root_cause}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Comments Section */}
                <TicketComments ticketId={ticket.id} />
            </div>

            {/* --- RIGHT COLUMN (Sidebar) --- */}
            <div className="space-y-6">
                
                {/* AI Assist (Staff Only) */}
                {!isCustomer && <SmartTicketAssist ticket={ticket} />}

                {/* Ticket Metadata Card */}
                <Card>
                    <CardHeader className="py-4 border-b border-gray-100 dark:border-slate-700">
                        <CardTitle className="text-base">Ticket Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-5">
                        {/* Assignee */}
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</span>
                            <div className="mt-2 flex items-center gap-3">
                                {ticket.assigned_to ? (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                                            {ticket.assigned_to.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.assigned_to}</p>
                                            <p className="text-xs text-gray-500">Support Agent</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500 italic text-sm">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center"><User className="w-4 h-4" /></div>
                                        Unassigned
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* SLA / Due Date */}
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Level Agreement</span>
                            <div className={`mt-2 p-3 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200' : 'bg-gray-50 border-gray-200 text-gray-900 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200'}`}>
                                <Flex align="center" gap={3}>
                                    <Timer className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="text-sm font-medium">{ticket.due_date ? new Date(ticket.due_date).toLocaleString() : 'No SLA set'}</p>
                                        {ticket.due_date && (
                                            <p className="text-xs opacity-80 mt-0.5">
                                                {isOverdue ? 'Overdue' : 'Due'} {(() => {
                                                    const diff = new Date(ticket.due_date).getTime() - new Date().getTime();
                                                    const hours = Math.abs(Math.round(diff / 36e5));
                                                    return `${hours} hours ${diff < 0 ? 'ago' : 'remaining'}`;
                                                })()}
                                            </p>
                                        )}
                                    </div>
                                </Flex>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-500">Category</span>
                                <p className="text-sm font-medium capitalize mt-1">{ticket.category.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Source</span>
                                <p className="text-sm font-medium mt-1">Web Portal</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscriber Card (Staff Only) */}
                {!isCustomer && (
                    <Card className="overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <CardHeader className="py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Subscriber</span>
                                {ticket.customer && <Badge variant="outline" className="font-normal">{ticket.customer.account_status}</Badge>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            {ticket.customer ? (
                                <>
                                    <Flex align="start" gap={3}>
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                            {ticket.customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{ticket.customer.name}</h4>
                                            <p className="text-xs text-gray-500">{ticket.customer.type.toUpperCase()}</p>
                                        </div>
                                    </Flex>

                                    <div className="space-y-3 pt-2">
                                        {ticket.customer.email && (
                                            <Flex gap={2} className="text-sm text-gray-600 dark:text-gray-300">
                                                <Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{ticket.customer.email}</span>
                                            </Flex>
                                        )}
                                        {ticket.customer.phone && (
                                            <Flex gap={2} className="text-sm text-gray-600 dark:text-gray-300">
                                                <Phone className="w-4 h-4 text-gray-400" /> <span>{ticket.customer.phone}</span>
                                            </Flex>
                                        )}
                                        {ticket.customer.address && (
                                            <Flex gap={2} className="text-sm text-gray-600 dark:text-gray-300 items-start">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" /> <span className="line-clamp-2">{ticket.customer.address}</span>
                                            </Flex>
                                        )}
                                        {ticket.customer.subscription_plan && (
                                            <Flex gap={2} className="text-sm text-gray-600 dark:text-gray-300">
                                                <Wifi className="w-4 h-4 text-gray-400" /> <span className="font-medium">{ticket.customer.subscription_plan}</span>
                                            </Flex>
                                        )}
                                    </div>

                                    <Button 
                                        variant="secondary" 
                                        className="w-full mt-2" 
                                        onClick={() => ticket.customer?.id && onCustomerClick(ticket.customer.id)}
                                    >
                                        View Full Profile
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-6 text-gray-500 italic">
                                    <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    No subscriber linked.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Grid>
      </div>

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
