
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, EmployeeStatus, Department } from '../../../types';
import { Save, ArrowLeft, User, Briefcase, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Grid } from '../../../components/ui/grid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Flex } from '../../../components/ui/flex';

interface EmployeeFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Employee;
  departments?: Department[];
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose, onSubmit, initialData, departments = [] }) => {
  // Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Work Details
  const [role, setRole] = useState<EmployeeRole>(EmployeeRole.SUPPORT);
  const [status, setStatus] = useState<EmployeeStatus>(EmployeeStatus.ACTIVE);
  const [department, setDepartment] = useState('');
  const [hireDate, setHireDate] = useState('');
  
  // Administrative
  const [identityNumber, setIdentityNumber] = useState('');
  const [certifications, setCertifications] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setRole(initialData.role);
      setStatus(initialData.status);
      setDepartment(initialData.department || '');
      setHireDate(initialData.hire_date ? new Date(initialData.hire_date).toISOString().split('T')[0] : '');
      setIdentityNumber(initialData.identity_number || '');
      setCertifications(initialData.certifications || '');
    } else {
      // Reset all fields for new entry
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setRole(EmployeeRole.SUPPORT);
      setStatus(EmployeeStatus.ACTIVE);
      setDepartment('');
      setHireDate('');
      setIdentityNumber('');
      setCertifications('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        phone: phone || undefined,
        address: address || undefined,
        role,
        status,
        department: department || undefined,
        hire_date: hireDate || undefined, 
        identity_number: identityNumber || undefined,
        certifications: certifications || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-6">
         <Flex align="center" gap={4}>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300">
             <ArrowLeft className="w-5 h-5" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Member' : 'New Member'}</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage staff profiles, roles, and administrative data</p>
           </div>
         </Flex>
      </div>

      <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
                  <TabsTrigger value="work"><Briefcase className="w-4 h-4 mr-2" />Work Details</TabsTrigger>
                  <TabsTrigger value="admin"><Fingerprint className="w-4 h-4 mr-2" />Administrative</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Grid cols={1} className="sm:grid-cols-2" gap={6}>
                    <div><Label htmlFor="name">Full Name</Label><Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" /></div>
                    <div><Label htmlFor="email">Email Address</Label><Input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@nexus-isp.com" /></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" /></div>
                    <div className="sm:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" value={address} onChange={e => setAddress(e.target.value)} /></div>
                  </Grid>
                </TabsContent>

                <TabsContent value="work" className="space-y-6">
                   <Grid cols={1} className="sm:grid-cols-2" gap={6}>
                        <div><Label htmlFor="role">Role</Label><Select id="role" value={role} onChange={e => setRole(e.target.value as EmployeeRole)}><option value={EmployeeRole.SUPPORT}>Support Agent</option><option value={EmployeeRole.TECHNICIAN}>Technician</option><option value={EmployeeRole.MANAGER}>Manager</option><option value={EmployeeRole.ADMIN}>Administrator</option></Select></div>
                        <div><Label htmlFor="status">Status</Label><Select id="status" value={status} onChange={e => setStatus(e.target.value as EmployeeStatus)}><option value={EmployeeStatus.ACTIVE}>Active</option><option value={EmployeeStatus.INACTIVE}>Inactive</option><option value={EmployeeStatus.ON_LEAVE}>On Leave</option></Select></div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            {departments.length > 0 ? (
                                <Select id="department" value={department} onChange={e => setDepartment(e.target.value)}>
                                    <option value="">-- Select Department --</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </Select>
                            ) : (
                                <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Field Ops" />
                            )}
                        </div>
                        <div><Label htmlFor="hireDate">Hire Date</Label><Input id="hireDate" type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} /></div>
                   </Grid>
                </TabsContent>

                <TabsContent value="admin" className="space-y-6">
                    <Grid cols={1} className="sm:grid-cols-2" gap={6}>
                        <div><Label htmlFor="identityNumber">Identity Number (KTP/ID)</Label><Input id="identityNumber" value={identityNumber} onChange={e => setIdentityNumber(e.target.value)} /></div>
                        <div className="sm:col-span-2"><Label htmlFor="certifications">Certifications</Label><Input id="certifications" value={certifications} onChange={e => setCertifications(e.target.value)} placeholder="e.g. MTCNA, CCNA, FO Certified" /><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate with commas.</p></div>
                    </Grid>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50 p-6 mt-4 border-t border-gray-100 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}><Save className="w-4 h-4 mr-2" /> Save Member</Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};
