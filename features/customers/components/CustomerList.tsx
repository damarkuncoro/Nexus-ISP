
import React, { useState, useEffect, useMemo } from 'react';
import { Customer, InstallationStatus, CustomerType } from '../../../types';
import { Search, Mail, Building, Trash2, MapPin, Wifi, ChevronRight, Users, LayoutList, Kanban, HardHat, CheckCircle2, Calendar, AlertTriangle, XCircle } from 'lucide-react';
import { CustomerStatusBadge, InstallationStatusBadge } from '../../../components/StatusBadges';
import { Flex, FlexItem } from '../../../components/ui/flex';
import { Grid } from '../../../components/ui/grid';
import { Input } from '../../../components/ui/input';
import { useAuth } from '../../../contexts/AuthContext';
import { EmptyState } from '../../../components/ui/empty-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

interface CustomerListProps {
  customers: Customer[];
  onDelete: (id: string) => void;
  onSelect?: (customer: Customer) => void;
  initialSearch?: string;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onDelete, onSelect, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const { hasPermission } = useAuth();

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [customers, searchTerm]);

  // Kanban Columns Definition
  const columns = [
      { id: InstallationStatus.PENDING_SURVEY, label: 'Pending Survey', icon: MapPin, color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300' },
      { id: InstallationStatus.SURVEY_COMPLETED, label: 'Survey Done', icon: CheckCircle2, color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' },
      { id: InstallationStatus.SCHEDULED, label: 'Scheduled', icon: Calendar, color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' },
      { id: InstallationStatus.INSTALLED, label: 'Installed', icon: HardHat, color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' },
      { id: InstallationStatus.SURVEY_FAILED, label: 'Issues / Failed', icon: XCircle, color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' },
  ];

  const getCustomersByStatus = (status: InstallationStatus) => {
      return filteredCustomers.filter(c => c.installation_status === status);
  };

  return (
    <div className="space-y-6">
        {/* Header Controls */}
        <Flex align="center" justify="between" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    type="text"
                    className="pl-10"
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg flex items-center shrink-0">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <LayoutList className="w-4 h-4" /> List
                </button>
                <button 
                    onClick={() => setViewMode('board')} 
                    className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'board' ? 'bg-white dark:bg-slate-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Kanban className="w-4 h-4" /> Installation Board
                </button>
            </div>
        </Flex>

        {/* Content Area */}
        {filteredCustomers.length > 0 ? (
            viewMode === 'list' ? (
                // LIST VIEW
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredCustomers.map((customer) => (
                        <li 
                        key={customer.id} 
                        onClick={() => onSelect && onSelect(customer)}
                        className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150 group ${onSelect ? 'cursor-pointer' : ''}`}
                        >
                        <Flex align="center" justify="between" className="px-4 py-4 sm:px-6">
                            <FlexItem grow className="min-w-0">
                            <Flex align="center" gap={3}>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{customer.name}</h3>
                                <CustomerStatusBadge status={customer.account_status} />
                                {customer.company && (
                                <Flex as="span" align="center" className="text-xs text-gray-400 dark:text-gray-500">
                                    <Building className="w-3 h-3 mr-1" />
                                    {customer.company}
                                </Flex>
                                )}
                            </Flex>
                            
                            <Grid cols={1} className="sm:grid-cols-2 mt-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Flex align="center">
                                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span className="truncate">{customer.email}</span>
                                </Flex>
                                {customer.subscription_plan && (
                                <Flex align="center">
                                    <Wifi className="flex-shrink-0 mr-1.5 h-4 w-4 text-primary-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{customer.subscription_plan}</span>
                                </Flex>
                                )}
                                {customer.address && (
                                <Flex align="center" className="col-span-1 sm:col-span-2">
                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    <span className="truncate">{customer.address}</span>
                                </Flex>
                                )}
                            </Grid>
                            </FlexItem>
                            
                            <Flex align="center" gap={2} className="ml-4">
                            <div className="hidden sm:block">
                                <InstallationStatusBadge status={customer.installation_status} />
                            </div>
                            {hasPermission('delete_records') && (
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                    <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Subscriber?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This is irreversible. All tickets, invoices, and devices for {customer.name} will be affected.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(customer.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            )}
                            {onSelect && (
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                            )}
                            </Flex>
                        </Flex>
                        </li>
                    ))}
                    </ul>
                </div>
            ) : (
                // BOARD VIEW
                <div className="overflow-x-auto pb-4">
                    <Flex gap={4} className="min-w-[1200px] h-[calc(100vh-220px)] items-stretch">
                        {columns.map(col => {
                            const items = getCustomersByStatus(col.id);
                            const Icon = col.icon;
                            
                            return (
                                <div key={col.id} className={`flex-1 min-w-[280px] flex flex-col rounded-xl border bg-gray-50/50 dark:bg-slate-900/30 ${col.color.replace('text', 'border')}`}>
                                    {/* Column Header */}
                                    <div className={`p-3 border-b flex justify-between items-center rounded-t-xl bg-white dark:bg-slate-800 ${col.color.replace('bg', 'border')}`}>
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4`} />
                                            <span className="font-semibold text-sm">{col.label}</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 border-0">{items.length}</Badge>
                                    </div>

                                    {/* Drop Zone / List */}
                                    <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                                        {items.map(customer => (
                                            <Card 
                                                key={customer.id} 
                                                onClick={() => onSelect && onSelect(customer)}
                                                className="cursor-pointer hover:shadow-md transition-all border-gray-200 dark:border-slate-700 group relative bg-white dark:bg-slate-800"
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            {customer.type === CustomerType.CORPORATE ? 
                                                                <Building className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> : 
                                                                <Users className="w-3 h-3 text-green-500 dark:text-green-400" />
                                                            }
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{customer.type}</span>
                                                        </div>
                                                        <CustomerStatusBadge status={customer.account_status} />
                                                    </div>
                                                    
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{customer.name}</h4>
                                                    
                                                    {customer.address && (
                                                        <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                            <span className="line-clamp-2">{customer.address}</span>
                                                        </div>
                                                    )}

                                                    <div className="pt-2 border-t border-gray-50 dark:border-slate-700 flex justify-between items-center mt-2">
                                                        {customer.subscription_plan ? (
                                                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">{customer.subscription_plan}</span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No Plan</span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {items.length === 0 && (
                                            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                                                <p className="text-xs text-gray-400 dark:text-gray-500">No subscribers in this stage</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Flex>
                </div>
            )
        ) : (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <EmptyState 
                    icon={Users}
                    title={customers.length === 0 ? "No subscribers yet" : "No results found"}
                    message={customers.length === 0 ? "Create a new customer to get started." : `No subscribers found matching "${searchTerm}".`}
                />
            </div>
        )}
    </div>
  );
};
