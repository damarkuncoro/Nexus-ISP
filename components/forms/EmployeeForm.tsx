import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, EmployeeStatus } from '../../types';
import { Save, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

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
      <div className="mb-6 flex items-center justify-between">
         <Button 
           variant="ghost"
           onClick={onClose} 
           className="text-gray-600 hover:text-gray-900 pl-0"
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
                <Label className="mb-1 block">Full Name</Label>
                <Input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <Label className="mb-1 block">Email Address</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@nexus-isp.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <Label className="mb-1 block">Role</Label>
                    <Select
                        value={role}
                        onChange={e => setRole(e.target.value as EmployeeRole)}
                    >
                        <option value={EmployeeRole.SUPPORT}>Support Agent</option>
                        <option value={EmployeeRole.TECHNICIAN}>Technician</option>
                        <option value={EmployeeRole.MANAGER}>Manager</option>
                        <option value={EmployeeRole.ADMIN}>Administrator</option>
                    </Select>
                </div>
                <div>
                    <Label className="mb-1 block">Status</Label>
                    <Select
                        value={status}
                        onChange={e => setStatus(e.target.value as EmployeeStatus)}
                    >
                        <option value={EmployeeStatus.ACTIVE}>Active</option>
                        <option value={EmployeeStatus.INACTIVE}>Inactive</option>
                        <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
                    </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <Label className="mb-1 block">Department</Label>
                    <Input
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="e.g. Field Ops"
                    />
                 </div>
                 <div>
                    <Label className="mb-1 block">Phone</Label>
                    <Input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                    />
                 </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50 border-t border-gray-100 py-4 px-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Member
                </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};