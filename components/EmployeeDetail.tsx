
import React from 'react';
import { Employee, Ticket, TicketStatus } from '../types';
import { ArrowLeft, Mail, Phone, Briefcase, Calendar, Edit2, Trash2, CheckCircle, Ticket as TicketIcon, Fingerprint, Home, Award, Clock, MapPin, AlertCircle } from 'lucide-react';
import { RoleBadge, EmployeeStatusBadge, TicketPriorityBadge } from './StatusBadges';
import { Flex } from './ui/flex';
import { Grid, GridItem } from './ui/grid';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface EmployeeDetailProps {
  employee: Employee;
  assignedTickets: Ticket[];
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onTicketClick: (ticket: Ticket) => void;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="p-2 bg-white border border-gray-100 rounded-md shadow-sm shrink-0">
            <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</p>
        </div>
    </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass, bgClass }: { label: string, value: number, icon: any, colorClass: string, bgClass: string }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
    </div>
);

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
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
       
       {/* Header Profile Section */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-blue-600" />
            
            <Flex justify="between" align="start" className="flex-col sm:flex-row gap-6 relative z-10">
                <Flex gap={6} align="start" className="w-full">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400 font-bold text-3xl shrink-0">
                        {employee.avatar_url ? (
                            <img src={employee.avatar_url} alt={employee.name} className="h-full w-full object-cover rounded-xl" />
                        ) : (
                            employee.name.charAt(0)
                        )}
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        <div>
                            <Flex align="center" gap={3} wrap="wrap" className="mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{employee.name}</h1>
                                <EmployeeStatusBadge status={employee.status} />
                            </Flex>
                            <Flex align="center" gap={2} className="text-gray-500 font-medium">
                                <Briefcase className="w-4 h-4" />
                                <span>{employee.department || 'No Department'}</span>
                                <span className="text-gray-300">•</span>
                                <RoleBadge role={employee.role} />
                            </Flex>
                        </div>

                        <Flex gap={6} wrap="wrap" className="pt-2">
                            <Flex align="center" gap={2} className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <Mail className="w-3.5 h-3.5 text-gray-400" /> {employee.email}
                            </Flex>
                            {employee.phone && (
                                <Flex align="center" gap={2} className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {employee.phone}
                                </Flex>
                            )}
                            {employee.hire_date && (
                                <Flex align="center" gap={2} className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Joined {new Date(employee.hire_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </Flex>
                            )}
                        </Flex>
                    </div>
                </Flex>

                <Flex direction="col" gap={2} align="end" className="shrink-0 w-full sm:w-auto">
                    <Button variant="ghost" onClick={onBack} className="mb-2 self-start sm:self-end">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    
                    {hasPermission('manage_team') && (
                        <Flex gap={2}>
                            <Button variant="outline" onClick={() => onEdit(employee)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-white text-red-600 border-red-200 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently remove {employee.name} from the system. Historic ticket associations may be preserved but the user account will be gone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(employee.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </Flex>
                    )}
                </Flex>
            </Flex>
       </div>

       {/* Key Metrics */}
       <Grid cols={1} className="sm:grid-cols-3" gap={6}>
            <StatCard label="Total Assignments" value={stats.totalAssigned} icon={TicketIcon} colorClass="text-blue-600" bgClass="bg-blue-50" />
            <StatCard label="Active Tasks" value={stats.active} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-50" />
            <StatCard label="Resolved Tickets" value={stats.resolved} icon={CheckCircle} colorClass="text-green-600" bgClass="bg-green-50" />
       </Grid>

       {/* Details Grid */}
       <Grid cols={1} className="lg:grid-cols-3" gap={8}>
          
          {/* Left Column: Personal Info */}
          <div className="space-y-6">
              <Card className="h-full border-t-4 border-t-gray-400">
                  <CardHeader>
                      <CardTitle className="text-base font-semibold text-gray-900">Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                      <DetailItem icon={Fingerprint} label="Identity Number (KTP/ID)" value={employee.identity_number} />
                      <DetailItem icon={Home} label="Home Address" value={employee.address} />
                      
                      <div className="mt-6 pt-6 border-t border-gray-100 px-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary-600" /> Certifications
                          </p>
                          {certificationsList.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                  {certificationsList.map((cert, idx) => (
                                      <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                                          {cert}
                                      </Badge>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-sm text-gray-400 italic">No certifications listed.</p>
                          )}
                      </div>
                  </CardContent>
              </Card>
          </div>

          {/* Right Column: Work History */}
          <div className="lg:col-span-2">
              <Card className="h-full border-t-4 border-t-primary-500">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-white">
                      <div className="flex items-center gap-2">
                        <TicketIcon className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-base font-semibold text-gray-900">Assigned Work</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-gray-500">{stats.totalAssigned} Items</Badge>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                      {assignedTickets.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                             {assignedTickets.map(ticket => (
                                 <div 
                                    key={ticket.id} 
                                    onClick={() => onTicketClick(ticket)}
                                    className="p-4 hover:bg-gray-50 cursor-pointer group transition-all duration-200"
                                 >
                                     <Flex justify="between" align="start">
                                         <Flex align="start" gap={3}>
                                             <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${ticket.status === TicketStatus.CLOSED ? 'bg-green-500' : ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                             <div>
                                                 <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{ticket.title}</h4>
                                                 <Flex align="center" gap={2} className="mt-1 text-xs text-gray-500">
                                                    <span className="font-mono bg-gray-100 px-1.5 rounded text-gray-600">#{String(ticket.id).slice(0,6)}</span>
                                                    {ticket.customer ? (
                                                        <span className="flex items-center gap-1"><span className="text-gray-300">•</span> {ticket.customer.name}</span>
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
                                                 ticket.status === TicketStatus.CLOSED ? 'text-green-600' : 
                                                 ticket.status === TicketStatus.IN_PROGRESS ? 'text-amber-600' : 
                                                 'text-blue-600'
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
                              <div className="bg-gray-50 p-4 rounded-full mb-3">
                                  <AlertCircle className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-sm font-medium text-gray-900">No Assignments</h3>
                              <p className="text-xs text-gray-500 mt-1 max-w-xs">No tickets are currently assigned to this team member.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
       </Grid>
    </div>
  );
};
