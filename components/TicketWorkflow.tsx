
import React, { useState } from 'react';
import { Ticket, TicketStatus, Employee } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Check, UserPlus, Play, CheckCircle2, Search, AlertTriangle, FileText, Microscope } from 'lucide-react';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';

interface TicketWorkflowProps {
  ticket: Ticket;
  employees: Employee[];
  onUpdateStatus: (updates: Partial<Ticket>) => Promise<void>;
}

export const TicketWorkflow: React.FC<TicketWorkflowProps> = ({ ticket, employees, onUpdateStatus }) => {
  const [assignee, setAssignee] = useState(ticket.assigned_to || '');
  const [resolutionNote, setResolutionNote] = useState(ticket.resolution_notes || '');
  const [rootCause, setRootCause] = useState(ticket.root_cause || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workflow Steps Definition
  const steps = [
    { status: TicketStatus.OPEN, label: 'Logged', icon: AlertTriangle },
    { status: TicketStatus.ASSIGNED, label: 'Assigned', icon: UserPlus },
    { status: TicketStatus.IN_PROGRESS, label: 'Working', icon: Play },
    { status: TicketStatus.RESOLVED, label: 'Resolved', icon: Check },
    { status: TicketStatus.VERIFIED, label: 'Verified', icon: Search },
    { status: TicketStatus.CLOSED, label: 'Closed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === ticket.status);

  const handleAssign = async () => {
    if (!assignee) return;
    setIsSubmitting(true);
    await onUpdateStatus({ status: TicketStatus.ASSIGNED, assigned_to: assignee });
    setIsSubmitting(false);
  };

  const handleStartWork = async () => {
    setIsSubmitting(true);
    await onUpdateStatus({ status: TicketStatus.IN_PROGRESS });
    setIsSubmitting(false);
  };

  const handleResolve = async () => {
    if (!resolutionNote) return alert("Please provide resolution notes.");
    setIsSubmitting(true);
    await onUpdateStatus({ 
        status: TicketStatus.RESOLVED, 
        resolution_notes: resolutionNote,
        root_cause: rootCause || undefined
    });
    setIsSubmitting(false);
  };

  const handleVerify = async () => {
    setIsSubmitting(true);
    await onUpdateStatus({ status: TicketStatus.VERIFIED });
    setIsSubmitting(false);
  };

  const handleClose = async () => {
    setIsSubmitting(true);
    await onUpdateStatus({ status: TicketStatus.CLOSED });
    setIsSubmitting(false);
  };

  return (
    <Card className="border-t-4 border-t-primary-500 dark:border-t-primary-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Incident Lifecycle Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual Stepper */}
        <Flex align="center" justify="between" className="mb-8 overflow-x-auto relative">
           <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-slate-700 -z-10" />
           {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              const Icon = step.icon;
              
              return (
                <Flex direction="col" align="center" key={step.status} className="bg-white dark:bg-slate-800 px-2 transition-colors duration-200">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                       isActive ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400' :
                       isCompleted ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400' :
                       'border-gray-200 text-gray-300 dark:border-slate-600 dark:text-slate-600'
                   }`}>
                      <Icon className="w-4 h-4" />
                   </div>
                   <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-500'}`}>
                       {step.label}
                   </span>
                </Flex>
              );
           })}
        </Flex>

        {/* Action Area based on current status */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            {ticket.status === TicketStatus.OPEN && (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Step 1: Assign to Technical Team</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Allocate a Field Engineer or Support Agent to handle this issue.</p>
                    </div>
                    
                    <Grid cols={1} className="sm:grid-cols-[1fr_auto]" gap={4} alignItems="end">
                        <div className="w-full">
                            <Label className="mb-1 block">Select Technician</Label>
                            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                                <option value="">-- Choose Agent --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                                ))}
                            </Select>
                        </div>
                        <Button 
                            onClick={handleAssign} 
                            isLoading={isSubmitting} 
                            disabled={!assignee || isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign & Proceed
                        </Button>
                    </Grid>
                </div>
            )}

            {ticket.status === TicketStatus.ASSIGNED && (
                <Flex justify="between" align="center">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Step 2: Acknowledge & Start</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Technician has received the ticket. Start troubleshooting.</p>
                    </div>
                    <Button onClick={handleStartWork} isLoading={isSubmitting}>
                        <Play className="w-4 h-4 mr-2" /> Start Troubleshooting
                    </Button>
                </Flex>
            )}

            {ticket.status === TicketStatus.IN_PROGRESS && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Step 3: Resolve & Report</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Issue fixed? Document the solution details below.</p>
                    
                    <Tabs defaultValue="resolution" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="resolution">
                                <FileText className="w-4 h-4 mr-2" /> Resolution Notes
                            </TabsTrigger>
                            <TabsTrigger value="rca">
                                <Microscope className="w-4 h-4 mr-2" /> Root Cause Analysis (RCA)
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="resolution" className="space-y-3">
                            <Label className="mb-1">Resolution Details <span className="text-red-500">*</span></Label>
                            <Textarea 
                                value={resolutionNote} 
                                onChange={(e) => setResolutionNote(e.target.value)}
                                placeholder="Describe the specific actions taken to fix the issue (e.g., replaced router, spliced fiber, reset port configuration)..."
                                className="min-h-[150px]"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Required for closure.</p>
                        </TabsContent>

                        <TabsContent value="rca" className="space-y-3">
                            <Label className="mb-1">Root Cause Analysis (RCA)</Label>
                            <Textarea 
                                value={rootCause} 
                                onChange={(e) => setRootCause(e.target.value)}
                                placeholder="Identify the underlying cause (e.g., cable cut by third party, power surge, configuration error)..."
                                className="min-h-[150px]"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Optional but recommended for recurring issues.</p>
                        </TabsContent>
                    </Tabs>

                    <Flex justify="end" className="mt-4 pt-2 border-t border-gray-200 dark:border-slate-700">
                         <Button onClick={handleResolve} isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                             <Check className="w-4 h-4 mr-2" /> Mark Resolved
                         </Button>
                    </Flex>
                </div>
            )}

            {ticket.status === TicketStatus.RESOLVED && (
                <Flex justify="between" align="center">
                     <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Step 4: Verify Fix</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Confirm with the customer that services are restored.</p>
                    </div>
                    <Flex gap={2}>
                        <Button variant="outline" onClick={handleStartWork} isLoading={isSubmitting}>
                             Not Fixed (Reopen)
                        </Button>
                        <Button onClick={handleVerify} isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                             <Search className="w-4 h-4 mr-2" /> Verify Success
                        </Button>
                    </Flex>
                </Flex>
            )}

            {ticket.status === TicketStatus.VERIFIED && (
                <Flex justify="between" align="center">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Step 5: Final Closure</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Review ticket data and close the incident.</p>
                    </div>
                    <Button onClick={handleClose} isLoading={isSubmitting} variant="secondary">
                         <CheckCircle2 className="w-4 h-4 mr-2" /> Close Ticket
                    </Button>
                </Flex>
            )}

            {ticket.status === TicketStatus.CLOSED && (
                <div className="text-center py-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        This ticket is closed.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Post-mortem data available in details.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};
