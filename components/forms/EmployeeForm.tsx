import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, EmployeeStatus } from '../../types';
import { Save, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Grid } from '../ui/grid';

interface EmployeeFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Employee;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<EmployeeRole>(EmployeeRole.SUPPORT);
  const [status, setStatus] = useState<EmployeeStatus>(EmployeeStatus.ACTIVE);
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setStatus(initialData.status);
      setPhone(initialData.phone || '');
      setDepartment(initialData.department || '');
    } else {
      setName('');
      setEmail('');
      setRole(EmployeeRole.SUPPORT);
      setStatus(EmployeeStatus.ACTIVE);
      setPhone('');
      setDepartment('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        role,
        status,
        phone: phone || undefined,
        department: department || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
         <Button 
           variant="ghost"
           onClick={onClose} 
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Team
         </Button>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
            <CardDescription>Manage staff access and roles within the system.</CardDescription>
          </CardHeader>
            
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@nexus-isp.com" />
              </div>

              <Grid cols={2} gap={6}>
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Select id="role" value={role} onChange={e => setRole(e.target.value as EmployeeRole)}>
                        <option value={EmployeeRole.SUPPORT}>Support Agent</option>
                        <option value={EmployeeRole.TECHNICIAN}>Technician</option>
                        <option value={EmployeeRole.MANAGER}>Manager</option>
                        <option value={EmployeeRole.ADMIN}>Administrator</option>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select id="status" value={status} onChange={e => setStatus(e.target.value as EmployeeStatus)}>
                        <option value={EmployeeStatus.ACTIVE}>Active</option>
                        <option value={EmployeeStatus.INACTIVE}>Inactive</option>
                        <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
                    </Select>
                </div>
              </Grid>

              <Grid cols={2} gap={6}>
                 <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Field Ops" />
                 </div>
                 <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
                 </div>
              </Grid>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50/50">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}><Save className="w-4 h-4 mr-2" /> Save Member</Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};
