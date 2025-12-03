
import React, { useState } from 'react';
import { Tag, Plus, Save, X, Edit2, Trash2, Database } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { TicketCategoryConfig } from '../../types';
import { Button } from '../ui/button';

export const CategorySettings: React.FC = () => {
  const { categories, addCategory, editCategory, removeCategory, seedDefaults } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<TicketCategoryConfig>>({});
  const [isSeeding, setIsSeeding] = useState(false);

  const startEdit = (cat: TicketCategoryConfig) => {
    setFormData(cat);
    setEditingId(cat.id);
    setIsAdding(false);
  };

  const startAdd = () => {
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
    if (!formData.name || !formData.code || !formData.sla_hours) {
        alert("Please fill in required fields (Name, Code, SLA)");
        return;
    }

    try {
        if (isAdding) {
            await addCategory(formData as any);
        } else if (editingId) {
            await editCategory(editingId, formData);
        }
        cancelEdit();
    } catch (e: any) {
        alert("Failed to save: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
      if(!window.confirm("Delete this category?")) return;
      try {
          await removeCategory(id);
      } catch (e: any) {
          alert("Failed to delete: " + e.message);
      }
  };

  const handleSeedDefaults = async () => {
      setIsSeeding(true);
      try {
          await seedDefaults();
      } catch (e: any) {
          alert("Failed to seed defaults: " + e.message);
      } finally {
          setIsSeeding(false);
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-500" />
                  Ticket Categories & SLA
              </h3>
              <p className="text-xs text-gray-500 mt-1">Configure default service level agreements (SLA) for each category.</p>
            </div>
            {!isAdding && !editingId && (
              <div className="flex gap-2">
                {categories.length === 0 && (
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleSeedDefaults}
                        isLoading={isSeeding}
                        className="bg-white"
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
              </div>
            )}
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code (Slug)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">SLA (Hours)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {isAdding && (
                        <tr className="bg-blue-50">
                            <td className="px-6 py-4">
                                <input 
                                  type="text" 
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                  placeholder="e.g. VoIP"
                                  value={formData.name || ''}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                  type="text" 
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                  placeholder="e.g. voip_issue"
                                  value={formData.code || ''}
                                  onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                  type="number" 
                                  min="1"
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border text-right"
                                  value={formData.sla_hours || 24}
                                  onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value)})}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                  type="text" 
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                  placeholder="Description..."
                                  value={formData.description || ''}
                                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="flex gap-2 justify-end">
                                    <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save className="w-4 h-4" /></button>
                                    <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    )}
                    
                    {categories.map((cat) => (
                        <tr key={cat.id} className={`transition-colors ${editingId === cat.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-4">
                                {editingId === cat.id ? (
                                    <input 
                                      type="text" 
                                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                      value={formData.name || ''}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                ) : (
                                    <div className="text-sm font-bold text-gray-900">{cat.name}</div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {editingId === cat.id ? (
                                    <input 
                                      type="text" 
                                      disabled
                                      className="block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm p-1 border text-gray-500 cursor-not-allowed"
                                      value={formData.code || ''}
                                    />
                                ) : (
                                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{cat.code}</div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {editingId === cat.id ? (
                                    <div className="flex items-center">
                                        <input 
                                          type="number" 
                                          min="1"
                                          className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border text-right mr-2"
                                          value={formData.sla_hours || 0}
                                          onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value) || 0})}
                                        />
                                        <span className="text-xs text-gray-500">hrs</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <span className={`text-sm font-bold mr-2 ${cat.sla_hours <= 4 ? 'text-red-600' : 'text-gray-700'}`}>{cat.sla_hours}</span>
                                        <span className="text-xs text-gray-500">hours</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {editingId === cat.id ? (
                                    <input 
                                      type="text" 
                                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                      value={formData.description || ''}
                                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                ) : (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{cat.description}</div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                {editingId === cat.id ? (
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save className="w-4 h-4" /></button>
                                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => startEdit(cat)} className="text-primary-600 hover:text-primary-800"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {categories.length === 0 && !isAdding && (
                <div className="text-center py-12 bg-gray-50">
                    <p className="text-gray-500 italic mb-4">No categories found.</p>
                    <Button 
                        variant="outline" 
                        onClick={handleSeedDefaults}
                        isLoading={isSeeding}
                    >
                        <Database className="w-4 h-4 mr-2" />
                        Setup Default Categories
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
};
