
import React from 'react';
import { SubscriptionPlan, Customer } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Users, Wifi, TrendingUp, Trash2, Edit2, Mail, MapPin, ArrowDown, ArrowUp } from 'lucide-react';
import { CustomerStatusBadge } from './StatusBadges';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';
import { Button } from './ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { useAuth } from '../contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { DetailHero, StatCard, DetailSection, PageHeader } from './blocks/DetailBlocks';

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
      
      <PageHeader onBack={onBack} actions={
         <>
           {hasPermission('manage_settings') && (
            <Button variant="outline" onClick={() => onEdit(plan)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Plan
            </Button>
           )}
           {hasPermission('delete_records') && (
             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader><AlertDialogTitle>Delete Plan?</AlertDialogTitle><AlertDialogDescription>This will remove the plan. Existing subscribers will not be affected but new ones cannot be assigned.</AlertDialogDescription></AlertDialogHeader>
                 <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(plan.id)}>Delete</AlertDialogAction></AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
           )}
         </>
      } />

      <DetailHero 
        title={plan.name}
        subtitle="Broadband Service Package"
        avatarFallback="P"
        roleIcon={Wifi}
        status={<span className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(plan.price, currency)}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span></span>}
        metadata={
            <div className="flex gap-6 mt-1">
                <Flex align="center" gap={2} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-800">
                    <ArrowDown className="w-4 h-4" /> {plan.download_speed} Download
                </Flex>
                <Flex align="center" gap={2} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800">
                    <ArrowUp className="w-4 h-4" /> {plan.upload_speed} Upload
                </Flex>
            </div>
        }
      />

      <Grid cols={1} className="md:grid-cols-3" gap={6}>
        <StatCard label="Active Subscribers" value={planCustomers.length} icon={Users} color="blue" />
        <StatCard label="Monthly Revenue" value={formatCurrency(monthlyRevenue, currency)} icon={TrendingUp} color="green" />
        <StatCard label="Service Type" value="Fiber Optic" icon={Wifi} color="purple" />
      </Grid>

      <DetailSection title="Assigned Customers" icon={Users}>
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
      </DetailSection>

    </div>
  );
};
