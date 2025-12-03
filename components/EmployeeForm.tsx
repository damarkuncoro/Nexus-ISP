import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, EmployeeStatus } from '../types';
import { Save, ArrowLeft } from 'lucide-react';

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
      // onClose handled by parent
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
         <button 
           onClick={onClose} 
           className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Team
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
                {initialData ? 'Edit Team Member' : 'Add Team Member'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Manage staff access and roles within the system.</p>
          </div>
            
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg border p-2.5"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg border p-2.5"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@nexus-isp.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        className="mt-1 block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={role}
                        onChange={e => setRole(e.target.value as EmployeeRole)}
                    >
                        <option value={EmployeeRole.SUPPORT}>Support Agent</option>
                        <option value={EmployeeRole.TECHNICIAN}>Technician</option>
                        <option value={EmployeeRole.MANAGER}>Manager</option>
                        <option value={EmployeeRole.ADMIN}>Administrator</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        className="mt-1 block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={status}
                        onChange={e => setStatus(e.target.value as EmployeeStatus)}
                    >
                        <option value={EmployeeStatus.ACTIVE}>Active</option>
                        <option value={EmployeeStatus.INACTIVE}>Inactive</option>
                        <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                        type="text"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg border p-2.5"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="e.g. Field Ops"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg border p-2.5"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                    />
                 </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Member
                    </>
                  )}
                </button>
            </div>
          </form>
      </div>
    </div>
  );
};