import React, { useState } from 'react';
import { Ticket, Employee } from '../../types';
import { ShieldAlert } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Alert } from '../ui/alert';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  employees: Employee[];
  onConfirm: (reason: string, assignee: string) => Promise<void>;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({ 
  isOpen, 
  onClose, 
  ticket, 
  employees, 
  onConfirm 
}) => {
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationAssignee, setEscalationAssignee] = useState(ticket.assigned_to || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationReason.trim()) {
        setError(true);
        return;
    }

    setIsSubmitting(true);
    try {
        await onConfirm(escalationReason, escalationAssignee);
        onClose();
    } catch (err) {
        console.error("Escalation error:", err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                Escalate Ticket
            </DialogTitle>
            <DialogDescription>
                This action requires immediate attention from the assigned team.
            </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <Alert variant="destructive" title="Escalation Impact">
                Escalating will force the priority to <strong>HIGH</strong> and notify supervisors immediately.
            </Alert>

            <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-900">
                    Reason for Escalation <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="reason"
                    rows={4}
                    placeholder="e.g. SLA breach imminent, Customer threatening churn..."
                    value={escalationReason}
                    onChange={(e) => {
                        setEscalationReason(e.target.value);
                        if (error) setError(false);
                    }}
                    error={error}
                    className="resize-none"
                />
                {error && <p className="text-xs text-red-500 font-medium">Please provide a reason.</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="assignee" className="text-gray-900">Reassign Ownership (Optional)</Label>
                <Select
                    id="assignee"
                    value={escalationAssignee}
                    onChange={(e) => setEscalationAssignee(e.target.value)}
                >
                    <option value="">-- Keep Current Owner --</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.role})
                        </option>
                    ))}
                </Select>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="destructive" isLoading={isSubmitting}>
                    Confirm Escalation
                </Button>
            </DialogFooter>
        </form>
    </Dialog>
  );
};