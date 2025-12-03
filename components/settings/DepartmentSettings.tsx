
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Save, X, Edit2, Trash2, MapPin, User } from 'lucide-react';
import { useDepartments } from '../../hooks/useDepartments';
import { useEmployees } from '../../hooks/useEmployees';
import { Department } from '../../types';
import { Button } from '../ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Flex } from '../ui/flex';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Card, CardHeader, CardContent } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { useToast } from '../../contexts/ToastContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export const DepartmentSettings: React.FC = () => {
  const { departments, loadDepartments, addDepartment, editDepartment, removeDepartment, loading } = useDepartments();
  const { employees, loadEmployees } = useEmployees();
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Department>>({});

  const canManage = hasPermission('manage_settings');

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, [loadDepartments, loadEmployees]);

  const startEdit = (dept: Department) => {
    if (!canManage) return;
    setFormData(dept);
    setEditingId(dept.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    if (!canManage) return;
    setFormData({ name: '', description: '', location: '', manager_name: '' });
    setEditingId(null);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setFormData({});
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!canManage) return;
    if (!formData.name) {
        toast.error("Department Name is required.");
        return;
    }

    try {
        if (isAdding) {
            await addDepartment(formData as any);
            toast.success("Department created successfully.");
        } else if (editingId) {
            await editDepartment(editingId, formData);
            toast.success("Department updated successfully.");
        }
        cancelEdit();
    } catch (e: any) {
        toast.error("Failed to save: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
      if (!canManage) return;
      try {
          await removeDepartment(id);
          toast.success("Department deleted.");
      } catch (e: any) {
          toast.error("Failed to delete: " + e.message);
      }
  };

  return (
    <Card>
        <CardHeader className="flex-col sm:flex-row justify-between sm:items-center gap-4 py-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 m-0">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  Departments
              </h3>
              <p className="text-xs text-gray-500 mt-1">Manage organization structure and teams.</p>
            </div>
            {canManage && !isAdding && !editingId && (
                <Button 
                    size="sm"
                    onClick={startAdd}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
            )}
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Department Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Manager / Lead</TableHead>
                      {canManage && <TableHead className="text-right w-32">Actions</TableHead>}
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {isAdding && canManage && (
                      <TableRow className="bg-blue-50">
                          <TableCell><Input placeholder="e.g. Finance" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})}/></TableCell>
                          <TableCell><Input placeholder="Description..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}/></TableCell>
                          <TableCell><Input placeholder="e.g. Floor 2" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})}/></TableCell>
                          <TableCell>
                              <Select value={formData.manager_name || ''} onChange={(e) => setFormData({...formData, manager_name: e.target.value})}>
                                  <option value="">-- Select Manager --</option>
                                  {employees.map(emp => (
                                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                                  ))}
                              </Select>
                          </TableCell>
                          <TableCell className="text-right">
                              <Flex gap={2} justify="end">
                                  <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-4 h-4 text-green-600" /></Button>
                                  <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="w-4 h-4 text-gray-500" /></Button>
                              </Flex>
                          </TableCell>
                      </TableRow>
                  )}
                  
                  {departments.map((dept) => (
                      <TableRow key={dept.id} className={`${editingId === dept.id ? 'bg-blue-50' : ''}`}>
                          <TableCell>{editingId === dept.id && canManage ? <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm font-bold text-gray-900">{dept.name}</div>}</TableCell>
                          <TableCell>{editingId === dept.id && canManage ? <Input value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} /> : <div className="text-sm text-gray-500 truncate max-w-xs">{dept.description || '-'}</div>}</TableCell>
                          <TableCell>
                              {editingId === dept.id && canManage ? 
                                <Input value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} /> : 
                                (dept.location && <Flex align="center" gap={1} className="text-xs text-gray-500"><MapPin className="w-3 h-3" />{dept.location}</Flex>)
                              }
                          </TableCell>
                          <TableCell>
                              {editingId === dept.id && canManage ? 
                                <Select value={formData.manager_name || ''} onChange={(e) => setFormData({...formData, manager_name: e.target.value})}>
                                    <option value="">-- Select Manager --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.name}>{emp.name}</option>
                                    ))}
                                </Select> : 
                                (dept.manager_name && <Flex align="center" gap={1} className="text-xs text-gray-500"><User className="w-3 h-3" />{dept.manager_name}</Flex>)
                              }
                          </TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                                {editingId === dept.id ? (
                                    <Flex gap={2} justify="end">
                                        <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-4 h-4 text-green-600" /></Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="w-4 h-4 text-gray-500" /></Button>
                                    </Flex>
                                ) : (
                                    <Flex gap={2} justify="end">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(dept)}><Edit2 className="w-4 h-4 text-primary-600" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-600" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Department?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Ensure no employees are assigned to this department before deleting.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(dept.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                        </AlertDialog>
                                    </Flex>
                                )}
                            </TableCell>
                          )}
                      </TableRow>
                  ))}
                  {departments.length === 0 && !isAdding && (
                      <TableRow>
                          <TableCell colSpan={canManage ? 5 : 4}>
                              <EmptyState 
                                icon={Building2}
                                title="No departments defined"
                                message="Create departments to organize your team."
                                action={canManage ? { label: "Add Department", onClick: startAdd } : undefined}
                              />
                          </TableCell>
                      </TableRow>
                  )}
              </TableBody>
          </Table>
        </CardContent>
    </Card>
  );
};
