
import React from 'react';
import { Employee, Ticket, TicketStatus } from '../../../types';
import { Mail, Phone, Briefcase, Calendar, Edit2, Trash2, CheckCircle, Ticket as TicketIcon, Fingerprint, Home, Award, Clock, AlertCircle } from 'lucide-react';
import { RoleBadge, EmployeeStatusBadge, TicketPriorityBadge } from '../../../components/StatusBadges';
import { Flex } from '../../../components/ui/flex';
import { Grid } from '../../../components/ui/grid';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { DetailHero, StatCard, DetailSection, InfoItem, PageHeader } from '../../../components/blocks/DetailBlocks';

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
  const { hasPermission } = useAuth();
  const stats = {
      totalAssigned: assignedTickets.length,
      active: assignedTickets.filter(t => t.status !== TicketStatus.CLOSED).length,
      resolved: assignedTickets.filter(t => t.status === TicketStatus.CLOSED).length
  };

  const certificationsList = employee.certifications ? employee.certifications.split(',').map(c => c.trim()).filter(c => c) : [];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       
       <PageHeader onBack={onBack} actions={
          hasPermission('manage_team') && (
            <>
              <Button variant="outline" onClick={() => onEdit(employee)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-white text-red-600 border-red-200 hover:bg-red-50 dark:bg-transparent dark:border-red-900 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will permanently remove {employee.name} from the system.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(employee.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </>
          )
       } />

       <DetailHero 
          title={employee.name}
          subtitle={
            <Flex align="center" gap={2}>
               <Briefcase className="w-4 h-4" />
               <span>{employee.department || 'No Department'}</span>
               <span className="text-gray-300 dark:text-slate-600">•</span>
               <RoleBadge role={employee.role} />
            </Flex>
          }
          status={<EmployeeStatusBadge status={employee.status} />}
          avatarUrl={employee.avatar_url}
          avatarFallback={employee.name}
          metadata={
            <>
              <Flex align="center" gap={2}><Mail className="w-3.5 h-3.5" /> {employee.email}</Flex>
              {employee.phone && <Flex align="center" gap={2}><Phone className="w-3.5 h-3.5" /> {employee.phone}</Flex>}
              {employee.hire_date && <Flex align="center" gap={2}><Calendar className="w-3.5 h-3.5" /> Joined {new Date(employee.hire_date).toLocaleDateString()}</Flex>}
            </>
          }
       />

       {/* Key Metrics */}
       <Grid cols={1} className="sm:grid-cols-3" gap={6}>
            <StatCard label="Total Assignments" value={stats.totalAssigned} icon={TicketIcon} color="blue" />
            <StatCard label="Active Tasks" value={stats.active} icon={Clock} color="amber" />
            <StatCard label="Resolved Tickets" value={stats.resolved} icon={CheckCircle} color="green" />
       </Grid>

       {/* Details Grid */}
       <Grid cols={1} className="lg:grid-cols-3" gap={8}>
          
          {/* Left Column: Personal Info */}
          <div className="space-y-6">
              <DetailSection title="Personal Details" icon={Fingerprint}>
                  <InfoItem icon={Fingerprint} label="Identity Number (KTP/ID)" value={employee.identity_number} />
                  <InfoItem icon={Home} label="Home Address" value={employee.address} />
                  
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary-600" /> Certifications
                      </p>
                      {certificationsList.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                              {certificationsList.map((cert, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-white border-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600">
                                      {cert}
                                  </Badge>
                              ))}
                          </div>
                      ) : (
                          <p className="text-sm text-gray-400 italic">No certifications listed.</p>
                      )}
                  </div>
              </DetailSection>
          </div>

          {/* Right Column: Work History */}
          <div className="lg:col-span-2">
              <DetailSection title="Assigned Work" icon={TicketIcon} action={<Badge variant="outline">{stats.totalAssigned} Items</Badge>}>
                  {assignedTickets.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-slate-700">
                          {assignedTickets.map(ticket => (
                              <div 
                                key={ticket.id} 
                                onClick={() => onTicketClick(ticket)}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-all duration-200"
                              >
                                  <Flex justify="between" align="start">
                                      <Flex align="start" gap={3}>
                                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ticket.status === TicketStatus.CLOSED ? 'bg-green-500' : ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                          <div>
                                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{ticket.title}</h4>
                                              <Flex align="center" gap={2} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1.5 rounded text-gray-600 dark:text-gray-300">#{String(ticket.id).slice(0,6)}</span>
                                                {ticket.customer ? (
                                                    <span className="flex items-center gap-1"><span className="text-gray-300 dark:text-slate-600">•</span> {ticket.customer.name}</span>
                                                ) : null}
                                                {ticket.due_date && (
                                                    <span className={`flex items-center gap-1 ml-2 ${new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED ? 'text-red-600 font-medium' : ''}`}>
                                                        <Clock className="w-3 h-3" /> {new Date(ticket.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                              </Flex>
                                          </div>
                                      </Flex>
                                      
                                      <Flex direction="col" align="end" gap={2}>
                                          <TicketPriorityBadge priority={ticket.priority} />
                                          <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                              ticket.status === TicketStatus.CLOSED ? 'text-green-600 dark:text-green-400' : 
                                              ticket.status === TicketStatus.IN_PROGRESS ? 'text-amber-600 dark:text-amber-400' : 
                                              'text-blue-600 dark:text-blue-400'
                                          }`}>
                                              {ticket.status.replace('_', ' ')}
                                          </span>
                                      </Flex>
                                  </Flex>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                              <AlertCircle className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Assignments</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">No tickets are currently assigned to this team member.</p>
                      </div>
                  )}
              </DetailSection>
          </div>
       </Grid>
    </div>
  );
};
