import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority, Customer } from '../types';
import { Search, Filter, MoreHorizontal, User, ChevronRight, AlertTriangle, LayoutList, Kanban, Calendar, Clock } from 'lucide-react';
import { TicketStatusBadge, TicketPriorityBadge, TicketCategoryBadge } from './StatusBadges';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';
import { EmptyState } from './ui/empty-state';

interface TicketListProps {
  tickets: Ticket[];
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (id: string) => void;
  onCustomerClick?: (customerId: string) => void;
  onTicketClick?: (ticket: Ticket) => void;
  onCreateTicket?: () => void;
  onUpdateTicket?: (id: string, updates: any) => void;
  onDeleteTicket?: (id: string) => void;
  customers?: Customer[];
  compact?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, onEdit, onDelete, onCustomerClick, onTicketClick, onCreateTicket, onUpdateTicket, onDeleteTicket, customers, compact = false }) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const TicketCardContent = ({ ticket }: { ticket: Ticket }) => {
      const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED;
      
      return (
        <Flex direction="col" className="h-full">
            <Flex align="start" justify="between" className="mb-2">
                <Flex align="center" gap={2} wrap="wrap">
                    <span className="text-xs font-mono text-gray-400">#{String(ticket.id).slice(0, 6)}</span>
                    <TicketPriorityBadge priority={ticket.priority} />
                    {ticket.is_escalated && (
                        <span className="text-[10px] font-bold text-red-600 flex items-center bg-red-50 px-1 rounded">
                            <AlertTriangle className="w-3 h-3 mr-0.5" /> Esc
                        </span>
                    )}
                </Flex>
                {viewMode === 'board' && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(ticket); }} className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                )}
            </Flex>
            
            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{ticket.title}</h4>
            
            <Flex align="center" gap={2} className="mb-3">
                {ticket.customer ? (
                    <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                        <User className="w-3 h-3 mr-1" />
                        {ticket.customer.name}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 italic">No customer</span>
                )}
                {ticket.category && <TicketCategoryBadge category={ticket.category} />}
            </Flex>

            <Flex justify="between" align="center" className="mt-auto pt-3 border-t border-gray-50 text-xs text-gray-500">
                <Flex align="center" gap={2}>
                    {ticket.assigned_to ? (
                        <div className="flex items-center gap-1" title={`Assigned to ${ticket.assigned_to}`}>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                {ticket.assigned_to.charAt(0)}
                            </div>
                            <span className="max-w-[80px] truncate">{ticket.assigned_to}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic flex items-center">
                            <User className="w-3 h-3 mr-1" /> Unassigned
                        </span>
                    )}
                </Flex>
                <Flex align="center" className={`${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : new Date(ticket.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                </Flex>
            </Flex>
        </Flex>
      );
  };

  if (tickets.length === 0 && !compact) {
    return (
        <EmptyState 
            icon={Filter}
            title="No tickets found"
            message="Get started by creating a new ticket."
            action={onCreateTicket ? { label: 'Create Ticket', onClick: onCreateTicket } : undefined}
        />
    );
  }

  if (viewMode === 'board' && !compact) {
      const columns = [
          { id: TicketStatus.OPEN, label: 'Open', color: 'bg-blue-50 border-blue-100', items: filteredTickets.filter(t => t.status === TicketStatus.OPEN) },
          { id: TicketStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-amber-50 border-amber-100', items: filteredTickets.filter(t => t.status === TicketStatus.IN_PROGRESS) },
          { id: TicketStatus.CLOSED, label: 'Closed', color: 'bg-green-50 border-green-100', items: filteredTickets.filter(t => t.status === TicketStatus.CLOSED) },
      ];

      return (
          <div className="space-y-4">
              <Flex direction="col" justify="between" align="center" gap={4} className="p-4 sm:flex-row rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm overflow-hidden">
                  <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <Input type="text" className="pl-10" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Flex align="center" gap={2} className="w-full sm:w-auto">
                        <div className="w-40">
                            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}>
                                <option value="all">All Priorities</option>
                                <option value={TicketPriority.HIGH}>High</option>
                                <option value={TicketPriority.MEDIUM}>Medium</option>
                                <option value={TicketPriority.LOW}>Low</option>
                            </Select>
                        </div>
                        <Flex className="bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setViewMode('list')} className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all"><LayoutList className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('board')} className="p-1.5 rounded bg-white text-primary-600 shadow-sm"><Kanban className="w-4 h-4" /></button>
                        </Flex>
                  </Flex>
              </Flex>

              <Grid cols={1} className="md:grid-cols-3 gap-6 h-[calc(100vh-250px)] overflow-x-auto pb-4">
                  {columns.map(col => (
                      <Flex direction="col" key={col.id} className={`h-full rounded-xl border ${col.color} bg-opacity-50`}>
                          <Flex justify="between" align="center" className="p-4 border-b border-gray-200/50">
                              <h3 className="font-semibold text-gray-700">{col.label}</h3>
                              <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{col.items.length}</span>
                          </Flex>
                          <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                              {col.items.map(ticket => (
                                  <div onClick={() => onTicketClick && onTicketClick(ticket)} key={ticket.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                                      <TicketCardContent ticket={ticket} />
                                  </div>
                              ))}
                              {col.items.length === 0 && (<div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">No tickets</div>)}
                          </div>
                      </Flex>
                  ))}
              </Grid>
          </div>
      );
  }

  return (
    <Card className="overflow-hidden">
      {!compact && (
        <Flex as="div" direction="col" justify="between" align="center" gap={4} className="p-4 border-b border-gray-200 bg-gray-50 sm:flex-row">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
            <Input type="text" className="pl-10" placeholder="Search tickets, subscribers, or agents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          <Flex align="center" gap={2} className="w-full sm:w-auto" wrap="wrap">
             <div className="w-36"><Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}><option value="all">All Statuses</option><option value={TicketStatus.OPEN}>Open</option><option value={TicketStatus.IN_PROGRESS}>In Progress</option><option value={TicketStatus.CLOSED}>Closed</option></Select></div>
             <div className="w-36"><Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}><option value="all">All Priorities</option><option value={TicketPriority.HIGH}>High</option><option value={TicketPriority.MEDIUM}>Medium</option><option value={TicketPriority.LOW}>Low</option></Select></div>
             <Flex className="bg-gray-200 p-1 rounded-lg ml-2">
                <button onClick={() => setViewMode('list')} className="p-1.5 rounded bg-white text-primary-600 shadow-sm"><LayoutList className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('board')} className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all"><Kanban className="w-4 h-4" /></button>
             </Flex>
          </Flex>
        </Flex>
      )}

      <ul className="divide-y divide-gray-100">
        {filteredTickets.map((ticket) => {
            const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED;

            return (
          <li key={ticket.id} className={`hover:bg-gray-50 transition-colors duration-150 group ${onTicketClick ? 'cursor-pointer' : ''}`} onClick={() => onTicketClick && onTicketClick(ticket)}>
            <Flex align="center" justify="between" className="px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1 pr-4">
                <Flex align="center" justify="between" className="mb-1">
                  <Flex align="center" gap={2}>
                    <p className="text-sm font-semibold text-primary-600 truncate">#{String(ticket.id).slice(0, 8)}...</p>
                    {ticket.is_escalated && (<AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />)}
                    {isOverdue && (<span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">OVERDUE</span>)}
                    {ticket.category && <TicketCategoryBadge category={ticket.category} />}
                    {ticket.customer && (onCustomerClick ? (<button onClick={(e) => { e.stopPropagation(); if(ticket.customer?.id) onCustomerClick(String(ticket.customer.id)); }} className="flex items-center text-xs text-gray-500 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 px-2 py-0.5 rounded-full transition-colors" title="View Customer Details"><User className="w-3 h-3 mr-1" />{ticket.customer.name}</button>) : (<span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><User className="w-3 h-3 mr-1" />{ticket.customer.name}</span>))}
                  </Flex>
                  {compact && <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>}
                </Flex>
                <Flex align="center" justify="between">
                  <p className="text-sm font-medium text-gray-900 truncate mr-2">{ticket.title}</p>
                  {compact && <TicketStatusBadge status={ticket.status} />}
                </Flex>
                {!compact && (
                   <Flex align="center" gap={4} className="mt-2 text-sm text-gray-500" wrap="wrap">
                    <TicketStatusBadge status={ticket.status} />
                    <TicketPriorityBadge priority={ticket.priority} />
                    <span className="flex items-center gap-1 text-xs"><Clock className="w-3 h-3" />Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.due_date && (<span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-bold' : ''}`}><Calendar className="w-3 h-3" />Due: {new Date(ticket.due_date).toLocaleDateString()}</span>)}
                    {ticket.assigned_to ? (<span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"><User className="w-3 h-3" />{ticket.assigned_to}</span>) : (<span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100"><User className="w-3 h-3" />Unassigned</span>)}
                  </Flex>
                )}
              </div>
              
              {!compact && (
                <Flex align="center" gap={2}>
                  <Flex align="center" gap={2} className="hidden group-hover:flex transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(ticket); }} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors" title="Edit"><MoreHorizontal className="w-5 h-5" /></button>
                  </Flex>
                  {onTicketClick && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />}
                </Flex>
              )}
              {compact && (
                 <Flex align="center">
                    <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(ticket); }} className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    {onTicketClick && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 ml-1" />}
                 </Flex>
              )}
            </Flex>
          </li>
        )})}
        {filteredTickets.length === 0 && (<li className="px-4 py-8 text-center text-gray-500 text-sm">No tickets found matching your filters.</li>)}
      </ul>
    </Card>
  );
};
