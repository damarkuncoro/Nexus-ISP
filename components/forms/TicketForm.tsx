
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, Customer, Employee, TicketCategoryConfig } from '../../types';
import { Save, FileText, Tag, ArrowLeft, CheckCircle, Microscope, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Grid, GridItem } from '../ui/grid';

interface TicketFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Partial<Ticket>;
  isLoading: boolean;
  customers: Customer[];
  employees: Employee[];
  categories: TicketCategoryConfig[];
}

export const TicketForm: React.FC<TicketFormProps> = ({ 
  onClose, 
  onSubmit, 
  initialData, 
  customers,
  employees,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>(TicketStatus.OPEN);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [category, setCategory] = useState<string>('internet_issue');
  const [customerId, setCustomerId] = useState<string>('');
  
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCause, setRootCause] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const isEditMode = !!(initialData && initialData.id);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const calculateSlaDueDate = (slaHours: number) => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + slaHours);
    return formatDateTimeLocal(targetDate);
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || TicketStatus.OPEN);
      setPriority(initialData.priority || TicketPriority.MEDIUM);
      const initCat = initialData.category || (categories.length > 0 ? categories[0].code : 'internet_issue');
      setCategory(initCat);
      
      setCustomerId(initialData.customer_id || '');
      setAssignedTo(initialData.assigned_to || '');
      
      if (initialData.due_date) {
          const d = new Date(initialData.due_date);
          if (!isNaN(d.getTime())) {
             setDueDate(formatDateTimeLocal(d));
          } else {
             setDueDate('');
          }
      } else {
          setDueDate('');
      }

      setResolutionNotes(initialData.resolution_notes || '');
      setRootCause(initialData.root_cause || '');
      setErrors({});
    } else {
      resetForm();
      if (categories.length > 0) {
          const defaultCat = categories[0];
          setCategory(defaultCat.code);
          setDueDate(calculateSlaDueDate(defaultCat.sla_hours));
      }
    }
  }, [initialData, categories]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(TicketStatus.OPEN);
    setPriority(TicketPriority.MEDIUM);
    setCustomerId('');
    setAssignedTo('');
    setDueDate('');
    setResolutionNotes('');
    setRootCause('');
    setErrors({});
  };

  const handleCategoryChange = (newCode: string) => {
      setCategory(newCode);
      const catConfig = categories.find(c => c.code === newCode);
      if (catConfig) {
          const newDueDate = calculateSlaDueDate(catConfig.sla_hours);
          setDueDate(newDueDate);
      }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!title.trim()) newErrors.title = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        title, 
        description, 
        status, 
        priority,
        category,
        customer_id: customerId === '' ? null : customerId,
        assigned_to: assignedTo || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        resolution_notes: resolutionNotes || null,
        root_cause: rootCause || null
      });
    } catch (err) {
      console.error("Form submit error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryConfig = categories.find(c => c.code === category);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
         <Button 
           variant="ghost"
           onClick={onClose} 
           className="text-gray-600 hover:text-gray-900"
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Tickets
         </Button>
      </div>

      <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit Support Ticket' : 'Create New Ticket'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
                {isEditMode ? `Updating Ticket #${initialData?.id?.substring(0, 8)}` : 'Fill in the details below to create a new support ticket.'}
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8">
                <Grid cols={1} className="lg:grid-cols-3" gap={10}>
                    <GridItem className="lg:col-span-2 space-y-6">
                        <div className="border-b border-gray-100 pb-3 mb-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-600" /> Issue Details
                            </h4>
                        </div>
                        <div>
                            <Label htmlFor="title" className="mb-1">Subject <span className="text-red-500">*</span></Label>
                            <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); if(errors.title) setErrors({...errors, title: false}); }} placeholder="e.g. No Internet Connection" error={errors.title} />
                            {errors.title && <p className="mt-1 text-xs text-red-600">Subject is required.</p>}
                        </div>
                        <div>
                            <Label htmlFor="customer" className="mb-1">Subscriber</Label>
                            <Select id="customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                                <option value="">-- Select Subscriber --</option>
                                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name} {c.address ? `• ${c.address}` : ''}</option>))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="description" className="mb-1">Description</Label>
                            <Textarea id="description" rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue, troubleshooting steps taken, and any error codes..." />
                        </div>
                    </GridItem>

                    <GridItem className="space-y-6 lg:pl-8 lg:border-l lg:border-gray-100">
                        <div className="border-b border-gray-100 pb-3 mb-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary-600" /> Triage
                            </h4>
                        </div>
                        <div>
                            <Label className="uppercase text-xs text-gray-500 mb-2 block">Priority</Label>
                            <Grid cols={3} gap={2}>
                                {[TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH].map((p) => (
                                    <button key={p} type="button" onClick={() => setPriority(p)} className={`px-2 py-2 text-xs font-medium rounded-md border text-center transition-all ${ priority === p ? (p === TicketPriority.HIGH ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500' : p === TicketPriority.MEDIUM ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-500' : 'bg-gray-100 border-gray-300 text-gray-800 ring-1 ring-gray-500') : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' }`}>
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </Grid>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="category">Category</Label>
                                {currentCategoryConfig && (<span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium border border-blue-100">SLA: {currentCategoryConfig.sla_hours}h</span>)}
                            </div>
                            <Select id="category" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                                {categories.length > 0 ? (categories.map((cat) => (<option key={cat.id} value={cat.code}>{cat.name}</option>))) : (<option value="internet_issue">Internet Issue (Default)</option>)}
                            </Select>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <Label htmlFor="status" className="mb-1">Status</Label>
                            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
                                <option value={TicketStatus.OPEN}>Open</option>
                                <option value={TicketStatus.ASSIGNED}>Assigned</option>
                                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                                <option value={TicketStatus.RESOLVED}>Resolved</option>
                                <option value={TicketStatus.VERIFIED}>Verified</option>
                                <option value={TicketStatus.CLOSED}>Closed</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="assignedTo" className="mb-1">Assigned Agent</Label>
                            <Select id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                                <option value="">-- Unassigned --</option>
                                {employees.map((emp) => (<option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dueDate" className="mb-1 flex items-center gap-2">Due Date / SLA <Clock className="w-3 h-3 text-gray-400" /></Label>
                            <Input type="datetime-local" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            <p className="text-[10px] text-gray-400 mt-1">Auto-calculated based on Category SLA.</p>
                        </div>
                    </GridItem>
                </Grid>

                <div className={`mt-8 transition-all duration-500 ease-in-out ${status === TicketStatus.RESOLVED || status === TicketStatus.VERIFIED || status === TicketStatus.CLOSED ? 'block' : 'hidden'}`}>
                    <Grid cols={1} className="md:grid-cols-2" gap={6}>
                        <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                            <Label htmlFor="resolution" className="text-green-800 mb-2 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Resolution Notes</Label>
                            <Textarea id="resolution" rows={3} className="border-green-200 focus:ring-green-500 focus:border-green-500" value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Describe how the issue was resolved..." />
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
                            <Label htmlFor="rca" className="text-purple-800 mb-2 flex items-center"><Microscope className="w-4 h-4 mr-2" /> Root Cause Analysis (RCA)</Label>
                            <Textarea id="rca" rows={3} className="border-purple-200 focus:ring-purple-500 focus:border-purple-500" value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Why did this issue occur? (e.g. Fiber cut, Power outage)" />
                        </div>
                    </Grid>
                </div>
            </CardContent>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Ticket' : 'Create Ticket'}
                </Button>
            </div>
          </form>
      </Card>
    </div>
  );
};
