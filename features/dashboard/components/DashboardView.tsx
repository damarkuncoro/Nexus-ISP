
import React, { useMemo, useEffect } from 'react';
import { Ticket, Customer, TicketStatus, AuditAction } from '../../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Ticket as TicketIcon, AlertCircle, AlertTriangle, UserX, BarChart2, PieChart as PieChartIcon, Activity, Package, Clock, FileText, User } from 'lucide-react';
import { Grid } from '../../../components/ui/grid';
import { Flex } from '../../../components/ui/flex';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableRow, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useInventory } from '../../inventory/hooks/useInventory';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import { useAlerts } from '../../alerts/hooks/useAlerts';

interface DashboardViewProps {
  tickets: Ticket[];
  customers: Customer[];
  onTicketClick: (ticket: Ticket) => void;
  onViewChange: (view: 'tickets' | 'inventory' | 'alerts') => void;
}

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: { title: string, value: number | string, icon: React.ElementType, colorClass: string, bgClass: string }) => (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-4">
        <Flex align="center" justify="between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${bgClass} dark:bg-slate-700`}>
            <Icon className={`w-6 h-6 ${colorClass} dark:text-white`} />
          </div>
        </Flex>
      </CardContent>
    </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-700 shadow-xl rounded-lg text-sm z-50">
        {label && <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
            <span className="font-medium text-gray-900 dark:text-gray-200">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ tickets, customers, onTicketClick, onViewChange }) => {
  const { items: inventoryItems, loadInventory } = useInventory();
  const { logs, loadLogs } = useAuditLogs();
  const { alerts, loadAlerts } = useAlerts();

  useEffect(() => {
      loadInventory();
      loadLogs();
      loadAlerts();
  }, [loadInventory, loadLogs, loadAlerts]);
  
  const stats = useMemo(() => {
    if (!tickets) {
      return { open: 0, overdue: 0, unassigned: 0, total: 0 };
    }
    const now = new Date();
    return {
      open: tickets.filter(t => t.status !== TicketStatus.CLOSED).length,
      overdue: tickets.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== TicketStatus.CLOSED).length,
      unassigned: tickets.filter(t => !t.assigned_to && t.status === TicketStatus.OPEN).length,
      total: tickets.length,
    };
  }, [tickets]);

  const lowStockItems = useMemo(() => {
      return inventoryItems.filter(i => i.quantity <= i.min_quantity).slice(0, 3);
  }, [inventoryItems]);

  const criticalAlerts = useMemo(() => {
      return alerts.filter(a => a.severity === 'critical').length;
  }, [alerts]);

  const ticketVolumeData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    return last7Days.map(day => {
        const dayString = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const count = tickets.filter(t => new Date(t.created_at).toDateString() === day.toDateString()).length;
        return { name: dayString, tickets: count };
    });
  }, [tickets]);

  const categoryDistributionData = useMemo(() => {
      const categoryCounts = tickets.reduce((acc, ticket) => {
          const categoryName = ticket.category ? ticket.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Other';
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#22c55e', '#64748b'];

  // Combine logs and format for recent activity
  const recentActivity = logs.slice(0, 6);

  const getActionColor = (action: AuditAction) => {
      switch (action) {
          case AuditAction.CREATE: return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
          case AuditAction.UPDATE: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
          case AuditAction.DELETE: return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
          default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Real-time operational metrics</p>
            </div>
            {criticalAlerts > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 animate-pulse cursor-pointer" onClick={() => onViewChange('alerts')}>
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-bold">{criticalAlerts} Critical Network Alerts</span>
                </div>
            )}
        </div>

        <Grid cols={1} className="sm:grid-cols-2 lg:grid-cols-4" gap={6}>
            <StatCard title="Open Tickets" value={stats.open} icon={AlertCircle} colorClass="text-blue-600" bgClass="bg-blue-50" />
            <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} colorClass="text-red-600" bgClass="bg-red-50" />
            <StatCard title="Unassigned" value={stats.unassigned} icon={UserX} colorClass="text-amber-600" bgClass="bg-amber-50" />
            <StatCard title="Total Tickets" value={stats.total} icon={TicketIcon} colorClass="text-gray-600" bgClass="bg-gray-100" />
        </Grid>

        <Grid cols={1} className="lg:grid-cols-5" gap={6}>
            <Card className="lg:col-span-3 dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base dark:text-white"><BarChart2 className="w-5 h-5 text-gray-500 dark:text-gray-400"/>Ticket Volume (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-72 w-full">
                    <ResponsiveContainer>
                        <LineChart data={ticketVolumeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="tickets" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 dark:bg-slate-800 dark:border-slate-700">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base dark:text-white"><PieChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>Tickets by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer>
                        <PieChart>
                             <Pie data={categoryDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                {categoryDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Grid>

        <Grid cols={1} className="lg:grid-cols-2" gap={6}>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="flex flex-row justify-between items-center border-b border-gray-100 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-base dark:text-white"><Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />System Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            {recentActivity.length > 0 ? recentActivity.map(log => (
                                <TableRow key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-100 dark:border-slate-700">
                                    <TableCell>
                                        <Flex align="center" gap={3}>
                                            <div className={`p-1.5 rounded-md ${getActionColor(log.action)}`}>
                                                <FileText className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-200">{log.action.toUpperCase()} <span className="text-gray-500 font-normal">{log.entity}</span></p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{log.details}</p>
                                            </div>
                                        </Flex>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><User className="w-3 h-3" /> {log.performed_by}</span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8 text-gray-500">No recent activity.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 dark:bg-slate-800 dark:border-t-slate-700 dark:border-r-slate-700 dark:border-b-slate-700">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-500"><Package className="w-5 h-5 text-amber-600" />Low Stock Alerts</CardTitle>
                    <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-700" onClick={() => onViewChange('inventory')}>Manage</Button>
                </CardHeader>
                <CardContent>
                    {lowStockItems.length > 0 ? (
                        <div className="space-y-3">
                            {lowStockItems.map(item => (
                                <Flex key={item.id} justify="between" align="center" className="p-3 bg-amber-50 dark:bg-slate-700/50 rounded-lg border border-amber-100 dark:border-slate-600">
                                    <div>
                                        <p className="font-medium text-amber-900 dark:text-amber-400 text-sm">{item.name}</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-500">SKU: {item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-amber-800 dark:text-amber-400">{item.quantity} <span className="text-xs font-normal">{item.unit}</span></p>
                                        <p className="text-[10px] text-amber-600 dark:text-amber-500">Min: {item.min_quantity}</p>
                                    </div>
                                </Flex>
                            ))}
                        </div>
                    ) : (
                        <Flex direction="col" align="center" justify="center" className="h-40 text-gray-400 dark:text-gray-500">
                            <Package className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">Stock levels are healthy.</p>
                        </Flex>
                    )}
                </CardContent>
            </Card>
        </Grid>
    </div>
  );
};
