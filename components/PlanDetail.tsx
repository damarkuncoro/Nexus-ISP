
import React from 'react';
import { SubscriptionPlan, Customer } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Users, Wifi, TrendingUp, Trash2, Edit2, Mail, MapPin } from 'lucide-react';
import { CustomerStatusBadge } from './StatusBadges';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';
import { Button } from './ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { useAuth } from '../contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface PlanDetailProps {
  plan: SubscriptionPlan;
  customers: Customer[];
  onBack: () => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
  onCustomerClick: (id: string) => void;
  currency: string;
}

export const PlanDetail: React.FC<PlanDetailProps> = ({ 
  plan, 
  customers, 
  onBack, 
  onEdit, 
  onDelete, 
  onCustomerClick, 
  currency 
}) => {
  const { hasPermission } = useAuth();
  const planCustomers = customers.filter(c => c.plan_id === plan.id);
  const monthlyRevenue = planCustomers.length * plan.price;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      <Flex direction="col" justify="between" gap={4} className="sm:flex-row sm:items-center border-b border-gray-200 dark:border-slate-700 pb-6">
        <Flex align="center" gap={4}>
          <Button 
            onClick={onBack} 
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h1>
             <Flex as="p" align="center" gap={2} className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-medium text-primary-600 dark:text-primary-400">{formatCurrency(plan.price, currency)}/mo</span>
                <span className="text-gray-300 dark:text-slate-600">•</span>
                <span>{plan.download_speed} ↓ / {plan.upload_speed} ↑</span>
             </Flex>
          </div>
        </Flex>
        
        <Flex gap={2}>
           {hasPermission('manage_settings') && (
            <Button variant="outline" onClick={() => onEdit(plan)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
           )}
           {hasPermission('delete_records') && (
             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader><AlertDialogTitle>Delete Plan?</AlertDialogTitle><AlertDialogDescription>This will remove the plan. Existing subscribers will not be affected but new ones cannot be assigned.</AlertDialogDescription></AlertDialogHeader>
                 <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(plan.id)}>Delete</AlertDialogAction></AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
           )}
        </Flex>
      </Flex>

      <Grid cols={1} className="md:grid-cols-3" gap={6}>
        <Flex align="center" gap={4} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planCustomers.length}</p>
            </div>
        </Flex>
        <Flex align="center" gap={4} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlyRevenue, currency)}</p>
            </div>
        </Flex>
        <Flex align="center" gap={4} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Wifi className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Type</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Fiber Optic</p>
            </div>
        </Flex>
      </Grid>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
           <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assigned Customers</h3>
        </div>
        
        {planCustomers.length === 0 ? (
           <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No customers are currently assigned to this plan.
           </div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Address</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {planCustomers.map((customer) => (
                        <TableRow 
                            key={customer.id} 
                            onClick={() => onCustomerClick(customer.id)}
                            className="cursor-pointer"
                        >
                            <TableCell className="whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{customer.company}</div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <CustomerStatusBadge status={customer.account_status} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <Flex align="center" className="text-sm text-gray-500 dark:text-gray-400">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    {customer.email}
                                </Flex>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                <Flex align="center" className="text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="truncate max-w-xs">{customer.address || 'N/A'}</span>
                                </Flex>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
      </div>

    </div>
  );
};
