import React, { useMemo } from 'react';
import { Ticket, Customer, TicketStatus } from '../types';
// FIX: Import `Legend` from recharts.
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Ticket as TicketIcon, AlertCircle, AlertTriangle, UserX, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Grid } from './ui/grid';
import { Flex } from './ui/flex';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableBody, TableRow, TableCell } from './ui/table';
import { TicketStatusBadge } from './StatusBadges';
import { Button } from './ui/button';

interface DashboardViewProps {
  tickets: Ticket[];
  customers: Customer[];
  onTicketClick: (ticket: Ticket) => void;
  onViewChange: (view: 'tickets') => void;
}

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: { title: string, value: number | string, icon: React.ElementType, colorClass: string, bgClass: string }) => (
    <Card>
      <CardContent className="p-4">
        <Flex align="center" justify="between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${bgClass}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
        </Flex>
      </CardContent>
    </Card>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ tickets, customers, onTicketClick, onViewChange }) => {
  
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

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Grid cols={1} className="sm:grid-cols-2 lg:grid-cols-4" gap={6}>
            <StatCard title="Open Tickets" value={stats.open} icon={AlertCircle} colorClass="text-blue-600" bgClass="bg-blue-50" />
            <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} colorClass="text-red-600" bgClass="bg-red-50" />
            <StatCard title="Unassigned" value={stats.unassigned} icon={UserX} colorClass="text-amber-600" bgClass="bg-amber-50" />
            <StatCard title="Total Tickets" value={stats.total} icon={TicketIcon} colorClass="text-gray-600" bgClass="bg-gray-100" />
        </Grid>

        <Grid cols={1} className="lg:grid-cols-5" gap={6}>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><BarChart2 className="w-5 h-5 text-gray-500"/>Ticket Volume (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-72 w-full">
                    <ResponsiveContainer>
                        <LineChart data={ticketVolumeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} />
                            <Line type="monotone" dataKey="tickets" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><PieChartIcon className="w-5 h-5 text-gray-500"/>Tickets by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer>
                        <PieChart>
                             <Pie data={categoryDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                {categoryDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </Grid>

        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-base"><Activity className="w-5 h-5 text-gray-500" />Recent Activity</CardTitle>
                <Button variant="link" size="sm" onClick={() => onViewChange('tickets')}>View All</Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableBody>
                        {recentTickets.map(ticket => (
                            <TableRow key={ticket.id} onClick={() => onTicketClick(ticket)} className="cursor-pointer">
                                <TableCell>
                                    <p className="font-medium text-gray-900">{ticket.title}</p>
                                    <p className="text-xs text-gray-500">#{ticket.id.slice(0,8)} • {ticket.customer?.name || 'No Customer'}</p>
                                </TableCell>
                                <TableCell><TicketStatusBadge status={ticket.status} /></TableCell>
                                <TableCell className="hidden md:table-cell text-right text-gray-500 text-xs">{new Date(ticket.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
};