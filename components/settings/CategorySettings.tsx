
import React, { useState, useEffect } from 'react';
import { Tag, Plus, Save, X, Edit2, Trash2, Database, Loader2 } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { TicketCategoryConfig } from '../../types';
import { Button } from '../ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Flex } from '../ui/flex';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/input';
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

export const CategorySettings: React.FC = () => {
  const { categories, loadCategories, addCategory, editCategory, removeCategory, seedDefaults, loading } = useCategories();
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<TicketCategoryConfig>>({});

  const canManage = hasPermission('manage_settings');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const startEdit = (cat: TicketCategoryConfig) => {
    if (!canManage) return;
    setFormData(cat);
    setEditingId(cat.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    if (!canManage) return;
    setFormData({ name: '', code: '', sla_hours: 24, description: '' });
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
    if (!formData.name || !formData.code || !formData.sla_hours) {
        toast.error("Please fill in Name, Code, and SLA hours.");
        return;
    }

    try {
        if (isAdding) {
            await addCategory(formData as any);
            toast.success("Category created successfully.");
        } else if (editingId) {
            await editCategory(editingId, formData);
            toast.success("Category updated successfully.");
        }
        cancelEdit();
    } catch (e: any) {
        toast.error("Failed to save: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
      if (!canManage) return;
      try {
          await removeCategory(id);
          toast.success("Category deleted.");
      } catch (e: any) {
          toast.error("Failed to delete: " + e.message);
      }
  };

  const handleSeedDefaults = async () => {
      if (!canManage) return;
      try {
          await seedDefaults();
          toast.success("Default categories have been set up.");
      } catch (e: any) {
          toast.error("Failed to seed defaults: " + e.message);
      }
  };

  return (
    <Card>
        <CardHeader className="flex-col sm:flex-row justify-between sm:items-center gap-4 py-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 m-0">
                  <Tag className="w-5 h-5 text-gray-500" />
                  Ticket Categories & SLA
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure service level agreements (SLA) for each category.</p>
            </div>
            {canManage && !isAdding && !editingId && (
              <Flex gap={2}>
                {categories.length === 0 && (
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleSeedDefaults}
                        isLoading={loading}
                        className="bg-white dark:bg-slate-700"
                    >
                        <Database className="w-4 h-4 mr-2" />
                        Setup Defaults
                    </Button>
                )}
                <Button 
                    size="sm"
                    onClick={startAdd}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
              </Flex>
            )}
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code (Slug)</TableHead>
                      <TableHead className="w-32">SLA (Hours)</TableHead>
                      <TableHead>Description</TableHead>
                      {canManage && <TableHead className="text-right w-32">Actions</TableHead>}
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {isAdding && canManage && (
                      <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                          <TableCell><Input placeholder="e.g. VoIP" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})}/></TableCell>
                          <TableCell><Input placeholder="e.g. voip_issue" value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_')})}/></TableCell>
                          <TableCell><Input type="number" min="1" className="text-right" value={formData.sla_hours || 24} onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value)})}/></TableCell>
                          <TableCell><Input placeholder="Description..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}/></TableCell>
                          <TableCell className="text-right">
                              <Flex gap={2} justify="end">
                                  <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-4 h-4 text-green-600" /></Button>
                                  <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="w-4 h-4 text-gray-500" /></Button>
                              </Flex>
                          </TableCell>
                      </TableRow>
                  )}
                  
                  {categories.map((cat) => (
                      <TableRow key={cat.id} className={`${editingId === cat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <TableCell>{editingId === cat.id && canManage ? <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} /> : <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{cat.name}</div>}</TableCell>
                          <TableCell>{editingId === cat.id && canManage ? <Input disabled value={formData.code || ''} /> : <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">{cat.code}</div>}</TableCell>
                          <TableCell>{editingId === cat.id && canManage ? <Input type="number" min="1" className="text-right" value={formData.sla_hours || 0} onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value) || 0})} /> : <div className={`text-sm font-bold text-right ${cat.sla_hours <= 4 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{cat.sla_hours} hrs</div>}</TableCell>
                          <TableCell>{editingId === cat.id && canManage ? <Input value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} /> : <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{cat.description}</div>}</TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                                {editingId === cat.id ? (
                                    <Flex gap={2} justify="end">
                                        <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-4 h-4 text-green-600" /></Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="w-4 h-4 text-gray-500" /></Button>
                                    </Flex>
                                ) : (
                                    <Flex gap={2} justify="end">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Edit2 className="w-4 h-4 text-primary-600" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-600" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Category?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Tickets using this category will not be affected but won't be able to use it anymore.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(cat.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                        </AlertDialog>
                                    </Flex>
                                )}
                            </TableCell>
                          )}
                      </TableRow>
                  ))}
                  {categories.length === 0 && !isAdding && (
                      <TableRow>
                          <TableCell colSpan={canManage ? 5 : 4}>
                              <EmptyState 
                                icon={Tag}
                                title="No categories defined"
                                message="Create custom ticket categories or set up the defaults."
                                action={canManage ? { label: "Setup Defaults", onClick: handleSeedDefaults } : undefined}
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
