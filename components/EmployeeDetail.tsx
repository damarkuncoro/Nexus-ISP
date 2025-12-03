
import React from 'react';
import { Employee, Ticket, TicketStatus } from '../types';
import { ArrowLeft, Mail, Phone, Briefcase, Calendar, Edit2, Trash2, CheckCircle, Ticket as TicketIcon } from 'lucide-react';
import { RoleBadge, EmployeeStatusBadge } from './StatusBadges';
import { Flex } from './ui/flex';
import { Grid, GridItem } from './ui/grid';
import { Button } from './ui/button';

interface EmployeeDetailProps {
  employee: Employee;
  assignedTickets: Ticket[];
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onTicketClick: (ticket: Ticket) => void;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ 
  employee, 
  assignedTickets, 
  onBack, 
  onEdit, 
  onDelete,
  onTicketClick
}) => {
  
  const stats = {
      totalAssigned: assignedTickets.length,
      active: assignedTickets.filter(t => t.status !== TicketStatus.CLOSED).length,
      resolved: assignedTickets.filter(t => t.status === TicketStatus.CLOSED).length
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <Flex direction="col" justify="between" gap={4} className="sm:flex-row sm:items-center border-b border-gray-200 pb-6">
        <Flex align="center" gap={4}>
          <Button 
            onClick={onBack} 
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100 hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          
          <Flex align="center" gap={4}>
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                {employee.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                <Flex align="center" gap={2} className="mt-1">
                    <RoleBadge role={employee.role} />
                    <EmployeeStatusBadge status={employee.status} />
                </Flex>
            </div>
          </Flex>
        </Flex>
        
        <Flex gap={2} className="self-end sm:self-auto">
           <Button variant="outline" onClick={() => onEdit(employee)}>
             <Edit2 className="w-4 h-4 mr-2" />
             Edit Profile
           </Button>
           <Button variant="destructive" onClick={() => onDelete(employee.id)}>
             <Trash2 className="w-4 h-4 mr-2" />
             Delete
           </Button>
        </Flex>
      </Flex>

      <Grid cols={1} className="md:grid-cols-3" gap={6}>
          <GridItem className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <Flex align="start" gap={3}>
                          <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                              <p className="text-sm text-gray-900">{employee.email}</p>
                          </div>
                      </Flex>
                      <Flex align="start" gap={3}>
                          <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Phone</p>
                              <p className="text-sm text-gray-900">{employee.phone || 'N/A'}</p>
                          </div>
                      </Flex>
                      <Flex align="start" gap={3}>
                          <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Department</p>
                              <p className="text-sm text-gray-900">{employee.department || 'General'}</p>
                          </div>
                      </Flex>
                      <Flex align="start" gap={3}>
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Joined</p>
                              <p className="text-sm text-gray-900">{new Date(employee.created_at).toLocaleDateString()}</p>
                          </div>
                      </Flex>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">Performance Overview</h3>
                      <Grid cols={2} gap={4}>
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
                              <p className="text-xs text-blue-600 font-medium">Active Tasks</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                              <p className="text-xs text-green-600 font-medium">Resolved</p>
                          </div>
                      </Grid>
                  </div>
              </div>
          </GridItem>

          <GridItem className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                  <Flex justify="between" align="center" className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <Flex align="center" gap={2}>
                        <TicketIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900">Assigned Tickets</h3>
                      </Flex>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          {stats.totalAssigned} Total
                      </span>
                  </Flex>
                  
                  {assignedTickets.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                         {assignedTickets.map(ticket => (
                             <Flex 
                                key={ticket.id} 
                                onClick={() => onTicketClick(ticket)}
                                justify="between"
                                align="center"
                                className="p-4 hover:bg-gray-50 cursor-pointer group transition-colors"
                             >
                                 <Flex align="center" gap={3}>
                                     <div className={`p-2 rounded-full ${ticket.status === TicketStatus.CLOSED ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                         {ticket.status === TicketStatus.CLOSED ? <CheckCircle className="w-4 h-4" /> : <TicketIcon className="w-4 h-4" />}
                                     </div>
                                     <div>
                                         <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{ticket.title}</p>
                                         <p className="text-xs text-gray-500">
                                            #{String(ticket.id).slice(0,8)} • {ticket.customer?.name || 'Unknown Customer'}
                                         </p>
                                     </div>
                                 </Flex>
                                 <div className="text-right">
                                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                         ticket.status === TicketStatus.CLOSED ? 'bg-green-50 text-green-700' : 
                                         ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-700' : 
                                         'bg-blue-50 text-blue-700'
                                     }`}>
                                         {ticket.status.replace('_', ' ').toUpperCase()}
                                     </span>
                                     <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                 </div>
                             </Flex>
                         ))}
                      </div>
                  ) : (
                      <div className="p-12 text-center text-gray-500">
                          <p>No tickets currently assigned to this employee.</p>
                      </div>
                  )}
              </div>
          </GridItem>
      </Grid>
    </div>
  );
};
