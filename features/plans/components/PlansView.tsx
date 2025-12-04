
import React from 'react';
import { SubscriptionPlan, Customer } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { Wifi, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Grid } from '../../../components/ui/grid';
import { Flex } from '../../../components/ui/flex';
import { Card, CardContent } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';

interface PlansViewProps {
  plans: SubscriptionPlan[];
  customers: Customer[];
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currency: string;
}

export const PlansView: React.FC<PlansViewProps> = ({ plans, customers, onSelectPlan, currency }) => {
  
  const getPlanStats = (planId: string) => {
    const planCustomers = customers.filter(c => c.plan_id === planId);
    return {
      count: planCustomers.length,
      revenue: planCustomers.length * (plans.find(p => p.id === planId)?.price || 0)
    };
  };

  const totalRevenue = customers.reduce((sum, customer) => {
    const plan = plans.find(p => p.id === customer.plan_id);
    return sum + (plan?.price || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <Grid cols={1} className="md:grid-cols-3" gap={6}>
        <Flex justify="between" align="center" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
           <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Plans</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{plans.length}</p></div>
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><Wifi className="w-6 h-6" /></div>
        </Flex>
        <Flex justify="between" align="center" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
           <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Subscribed Users</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{customers.filter(c => c.plan_id).length}<span className="text-sm font-normal text-gray-400 ml-2">/ {customers.length} total</span></p></div>
           <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><Users className="w-6 h-6" /></div>
        </Flex>
        <Flex justify="between" align="center" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
           <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Monthly Revenue</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalRevenue, currency)}</p></div>
           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-6 h-6" /></div>
        </Flex>
      </Grid>

      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subscription Packages</h2>
        {plans.length > 0 ? (
            <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3" gap={6}>
            {plans.map(plan => {
                const stats = getPlanStats(plan.id);
                return (
                <Card 
                    key={plan.id} 
                    onClick={() => onSelectPlan(plan)}
                    className="hover:shadow-md transition-all cursor-pointer group dark:bg-slate-800 dark:border-slate-700"
                >
                    <CardContent className="p-6">
                    <Flex justify="between" align="start" className="mb-4">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400"><Wifi className="w-6 h-6" /></div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">{stats.count} Users</span>
                    </Flex>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                    <Flex align="baseline" gap={1} className="mb-4">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(plan.price, currency)}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">/mo</span>
                    </Flex>
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <Flex justify="between" align="center" className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><ArrowDownRight className="w-4 h-4 text-emerald-500" /> Download</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{plan.download_speed}</span>
                        </Flex>
                        <Flex justify="between" align="center" className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-blue-500" /> Upload</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{plan.upload_speed}</span>
                        </Flex>
                    </div>
                    </CardContent>
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-3 border-t border-gray-200 dark:border-slate-700">
                        <Flex justify="between" align="center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Revenue: {formatCurrency(stats.revenue, currency)}</span>
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">View Details →</span>
                        </Flex>
                    </div>
                </Card>
                );
            })}
            </Grid>
        ) : (
            <EmptyState 
                icon={Wifi}
                title="No service plans created"
                message="Add a new subscription plan to get started."
            />
        )}
      </div>
    </div>
  );
};
