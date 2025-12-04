
import React, { useMemo } from 'react';
import { Customer, Ticket, TicketStatus, CustomerStatus } from '../types';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Activity, DollarSign, BarChart3, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Grid } from './ui/grid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { formatCurrency } from '../utils/formatters';

interface ReportsViewProps {
  customers: Customer[];
  tickets: Ticket[];
  currency: string;
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-700 shadow-xl rounded-lg text-sm z-50">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-gray-500 dark:text-gray-400 capitalize">{entry.name}:</span>
            <span className="font-medium text-gray-900 dark:text-gray-200">
                {entry.name.toLowerCase().includes('revenue') ? formatCurrency(entry.value, currency) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ReportsView: React.FC<ReportsViewProps> = ({ customers, tickets, currency }) => {
  
  // --- Business Data Simulation ---
  const businessData = useMemo(() => {
      // Simulate 12 months of history based on current customer count
      const activeCount = customers.filter(c => c.account_status === CustomerStatus.ACTIVE).length;
      const data = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let currentBase = Math.max(10, activeCount - 20); // Start lower to show growth
      
      for (let i = 0; i < 12; i++) {
          const growth = Math.floor(Math.random() * 5) + 1;
          const churn = Math.floor(Math.random() * 2);
          currentBase = currentBase + growth - churn;
          
          // Est. Revenue = Users * Avg Plan Price (~$40)
          const revenue = currentBase * 45; 
          
          data.push({
              name: months[i],
              subscribers: currentBase,
              revenue: revenue,
              churn: churn,
              new: growth
          });
      }
      // Force last month to match actuals loosely
      data[11].subscribers = activeCount;
      
      return data;
  }, [customers]);

  const arpu = useMemo(() => {
      const active = customers.filter(c => c.account_status === CustomerStatus.ACTIVE);
      if (active.length === 0) return 0;
      // In a real app, calculate from actual invoices. Here we estimate.
      return businessData[11].revenue / active.length;
  }, [customers, businessData]);

  // --- Support Data Simulation ---
  const supportData = useMemo(() => {
      // SLA Stats
      const slaBreached = tickets.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== TicketStatus.CLOSED).length;
      const slaMet = tickets.length - slaBreached;

      // Tech Performance (Mocked as we don't have full history)
      const techs = Array.from(new Set(tickets.map(t => t.assigned_to).filter(Boolean)));
      const techStats = techs.map(tech => {
          const assigned = tickets.filter(t => t.assigned_to === tech);
          const resolved = assigned.filter(t => t.status === TicketStatus.CLOSED).length;
          return { name: tech, resolved, total: assigned.length, rating: (4 + Math.random()).toFixed(1) };
      }).sort((a, b) => b.resolved - a.resolved).slice(0, 5); // Top 5

      return {
          slaData: [
              { name: 'Within SLA', value: slaMet },
              { name: 'SLA Breached', value: slaBreached }
          ],
          techStats
      };
  }, [tickets]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into business and operational performance.</p>
            </div>
            <div className="flex gap-2">
                <select className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200">
                    <option>Last 12 Months</option>
                    <option>Year to Date</option>
                    <option>Last Quarter</option>
                </select>
            </div>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
            <TabsList>
                <TabsTrigger value="business"><TrendingUp className="w-4 h-4 mr-2" /> Business Growth</TabsTrigger>
                <TabsTrigger value="support"><Users className="w-4 h-4 mr-2" /> Support Performance</TabsTrigger>
                <TabsTrigger value="network"><Activity className="w-4 h-4 mr-2" /> Network Health</TabsTrigger>
            </TabsList>

            {/* --- BUSINESS TAB --- */}
            <TabsContent value="business" className="space-y-6">
                <Grid cols={1} className="md:grid-cols-3" gap={6}>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue (YTD)</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(businessData.reduce((acc, curr) => acc + curr.revenue, 0), currency)}</p>
                                <span className="text-xs text-green-600 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs last year</span>
                            </div>
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400"><DollarSign className="w-6 h-6" /></div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ARPU (Avg Revenue/User)</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(arpu, currency)}</p>
                                <span className="text-xs text-gray-400 mt-1">Industry Avg: {formatCurrency(35, currency)}</span>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400"><BarChart3 className="w-6 h-6" /></div>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Churn Rate</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1.2%</p>
                                <span className="text-xs text-green-600 flex items-center mt-1"><CheckCircle className="w-3 h-3 mr-1" /> Healthy (&lt;2%)</span>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400"><Users className="w-6 h-6" /></div>
                        </CardContent>
                    </Card>
                </Grid>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>Revenue Growth (MRR)</CardTitle>
                            <CardDescription>Monthly recurring revenue trend.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={businessData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>Subscriber Acquisition vs Churn</CardTitle>
                            <CardDescription>New activations compared to cancellations.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={businessData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                    <Legend />
                                    <Bar dataKey="new" name="New Users" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="churn" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* --- SUPPORT TAB --- */}
            <TabsContent value="support" className="space-y-6">
                <Grid cols={1} className="lg:grid-cols-3" gap={6}>
                    <Card className="lg:col-span-2 dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>Technician Leaderboard</CardTitle>
                            <CardDescription>Top performing support staff this month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-slate-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Agent Name</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Tickets Solved</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Avg Rating</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Efficiency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supportData.techStats.length > 0 ? supportData.techStats.map((tech, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{tech.name || 'Unknown'}</td>
                                                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-300">{tech.resolved}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        ★ {tech.rating}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 max-w-[80px] mx-auto">
                                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (tech.resolved / Math.max(1, tech.total)) * 100)}%` }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="text-center py-4 text-gray-500">No data available</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>SLA Compliance</CardTitle>
                            <CardDescription>Tickets resolved within time limits.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={supportData.slaData} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {supportData.slaData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </TabsContent>

            {/* --- NETWORK TAB --- */}
            <TabsContent value="network" className="space-y-6">
                <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-4" gap={6}>
                    <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">System Uptime (30d)</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">99.98%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Latency (Core)</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4.2 ms</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Packet Loss</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0.01%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-800 border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Critical Alerts (24h)</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">2</p>
                        </CardContent>
                    </Card>
                </Grid>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>Network Incident History</CardTitle>
                        <CardDescription>Incidents reported by category over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Jul', outage: 1, degradation: 4, maintenance: 2 },
                                    { name: 'Aug', outage: 0, degradation: 2, maintenance: 3 },
                                    { name: 'Sep', outage: 2, degradation: 5, maintenance: 1 },
                                    { name: 'Oct', outage: 0, degradation: 1, maintenance: 2 },
                                    { name: 'Nov', outage: 1, degradation: 3, maintenance: 4 },
                                    { name: 'Dec', outage: 0, degradation: 2, maintenance: 2 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="outage" name="Outages" stackId="a" fill="#ef4444" />
                                <Bar dataKey="degradation" name="Degradation" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};
