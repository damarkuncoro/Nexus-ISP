
import React, { useState } from 'react';
import { Employee, Department } from '../../../types';
import { Search, Mail, Phone, Briefcase, Trash2, Edit2, ChevronRight, LayoutGrid, List, MoreHorizontal } from 'lucide-react';
import { RoleBadge, EmployeeStatusBadge } from '../../../components/StatusBadges';
import { Flex } from '../../../components/ui/flex';
import { Grid } from '../../../components/ui/grid';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { useAuth } from '../../../contexts/AuthContext';
import { EmptyState } from '../../../components/ui/empty-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

interface EmployeeListProps {
  employees: Employee[];
  departments?: Department[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onSelect?: (employee: Employee) => void;
}

interface DeleteDialogProps {
  employee: Employee;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ employee, onDelete, children }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      {children}
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
          <AlertDialogDescription>
              Are you sure you want to remove {employee.name}? They will no longer have access to the system.
          </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }}>Remove</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, departments = [], onEdit, onDelete, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { hasPermission } = useAuth();

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = departmentFilter === 'all' || employee.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <Flex justify="between" align="center" gap={4} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex-col sm:flex-row">
        <Flex gap={3} className="w-full sm:w-auto flex-1">
            <div className="relative w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    type="text"
                    className="pl-10"
                    placeholder="Search name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {departments.length > 0 && (
                <div className="w-40 hidden sm:block">
                    <Select 
                        value={departmentFilter} 
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="all">All Depts</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </Select>
                </div>
            )}
        </Flex>

        <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg flex items-center shrink-0">
            <button 
                onClick={() => setViewMode('table')} 
                className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-gray-900 dark:bg-slate-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                title="List View"
            >
                <List className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-gray-900 dark:bg-slate-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                title="Grid View"
            >
                <LayoutGrid className="w-4 h-4" />
            </button>
        </div>
      </Flex>

      {/* Content Area */}
      {filteredEmployees.length > 0 ? (
        <>
            {viewMode === 'table' ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Employee</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow 
                                    key={employee.id} 
                                    className="cursor-pointer group"
                                    onClick={() => onSelect && onSelect(employee)}
                                >
                                    <TableCell>
                                        <Flex align="center" gap={3}>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={employee.avatar_url} />
                                                <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">{employee.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{employee.name}</p>
                                                {employee.identity_number && <p className="text-xs text-gray-500 dark:text-gray-400">ID: {employee.identity_number}</p>}
                                            </div>
                                        </Flex>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Flex align="center" className="text-xs text-gray-500 dark:text-gray-400">
                                                <Mail className="w-3 h-3 mr-1.5" /> {employee.email}
                                            </Flex>
                                            {employee.phone && (
                                                <Flex align="center" className="text-xs text-gray-500 dark:text-gray-400">
                                                    <Phone className="w-3 h-3 mr-1.5" /> {employee.phone}
                                                </Flex>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell><RoleBadge role={employee.role} /></TableCell>
                                    <TableCell><EmployeeStatusBadge status={employee.status} /></TableCell>
                                    <TableCell>
                                        {employee.department ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {employee.department}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Flex justify="end" align="center" gap={2}>
                                            {hasPermission('manage_team') && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); onEdit(employee); }}
                                                        className="h-8 w-8 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <DeleteDialog employee={employee} onDelete={onDelete}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </DeleteDialog>
                                                </div>
                                            )}
                                            {onSelect && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                                        </Flex>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <Grid cols={1} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap={6}>
                    {filteredEmployees.map((employee) => (
                        <Card 
                            key={employee.id} 
                            onClick={() => onSelect && onSelect(employee)}
                            className="hover:shadow-md transition-all cursor-pointer border-t-4 border-t-transparent hover:border-t-primary-500 group"
                        >
                            <CardContent className="p-6">
                                <Flex justify="end" className="mb-[-20px]">
                                    {hasPermission('manage_team') && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(employee); }}>
                                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DeleteDialog employee={employee} onDelete={onDelete}>
                                                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 w-full">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                                                    </div>
                                                </DeleteDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </Flex>

                                <Flex direction="col" align="center" className="text-center mb-6">
                                    <Avatar className="h-20 w-20 mb-4 border-4 border-white dark:border-slate-700 shadow-sm bg-gray-50 dark:bg-slate-700">
                                        <AvatarImage src={employee.avatar_url} />
                                        <AvatarFallback className="text-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">{employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{employee.name}</h3>
                                    <Flex align="center" gap={2} className="mt-2">
                                        <RoleBadge role={employee.role} />
                                        <EmployeeStatusBadge status={employee.status} />
                                    </Flex>
                                </Flex>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <Flex align="center" gap={3} className="text-sm text-gray-600 dark:text-gray-300">
                                        <div className="p-1.5 bg-gray-50 dark:bg-slate-700 rounded text-gray-400"><Mail className="w-3.5 h-3.5" /></div>
                                        <span className="truncate">{employee.email}</span>
                                    </Flex>
                                    {employee.department && (
                                        <Flex align="center" gap={3} className="text-sm text-gray-600 dark:text-gray-300">
                                            <div className="p-1.5 bg-gray-50 dark:bg-slate-700 rounded text-gray-400"><Briefcase className="w-3.5 h-3.5" /></div>
                                            <span className="truncate">{employee.department}</span>
                                        </Flex>
                                    )}
                                    {employee.phone && (
                                        <Flex align="center" gap={3} className="text-sm text-gray-600 dark:text-gray-300">
                                            <div className="p-1.5 bg-gray-50 dark:bg-slate-700 rounded text-gray-400"><Phone className="w-3.5 h-3.5" /></div>
                                            <span className="truncate">{employee.phone}</span>
                                        </Flex>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>
            )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12">
            <EmptyState 
                icon={Briefcase}
                title="No team members found"
                message={employees.length === 0 ? "Add a new member to your team to get started." : `No members found matching "${searchTerm}".`}
            />
        </div>
      )}
    </div>
  );
};
