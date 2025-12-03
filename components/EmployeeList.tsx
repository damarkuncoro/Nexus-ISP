
import React, { useState } from 'react';
import { Employee } from '../types';
import { Search, Mail, Phone, Briefcase, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { RoleBadge, EmployeeStatusBadge } from './StatusBadges';
import { Flex, FlexItem } from './ui/flex';
import { Input } from './ui/input';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onSelect?: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onDelete, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {filteredEmployees.map((employee) => (
          <li 
            key={employee.id} 
            onClick={() => onSelect && onSelect(employee)}
            className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer group`}
          >
            <Flex align="center" justify="between" className="px-4 py-4 sm:px-6">
              <Flex align="center" gap={4} className="min-w-0 flex-1">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {employee.name.charAt(0)}
                </div>
                <FlexItem grow className="min-w-0">
                  <Flex align="center" gap={2} className="mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">{employee.name}</h3>
                    <RoleBadge role={employee.role} />
                    <EmployeeStatusBadge status={employee.status} />
                  </Flex>
                  <Flex align="center" gap={4} className="text-xs text-gray-500">
                    <Flex align="center">
                      <Mail className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{employee.email}</span>
                    </Flex>
                    {employee.phone && (
                        <Flex align="center">
                        <Phone className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{employee.phone}</span>
                        </Flex>
                    )}
                    {employee.department && (
                        <Flex align="center">
                        <Briefcase className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{employee.department}</span>
                        </Flex>
                    )}
                  </Flex>
                </FlexItem>
              </Flex>

              <Flex align="center" gap={2}>
                <Flex gap={2} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                    >
                    <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(employee.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                </Flex>
                {onSelect && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />}
              </Flex>
            </Flex>
          </li>
        ))}
        {filteredEmployees.length === 0 && (
          <li className="px-4 py-12 text-center text-gray-500 text-sm">
            No team members found.
          </li>
        )}
      </ul>
    </div>
  );
};
