
import React from 'react';
import { Customer, Ticket, Invoice, TicketStatus, InvoiceStatus } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { Wifi, FileText, Activity, AlertCircle, CheckCircle2, Clock, Download, Plus, Smartphone, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Grid, GridItem } from '../../../components/ui/grid';
import { Flex } from '../../../components/ui/flex';
import { Badge } from '../../../components/ui/badge';
import { TicketStatusBadge, InvoiceStatusBadge } from '../../../components/StatusBadges';
import { BandwidthMonitor } from '../../../components/BandwidthMonitor';

interface ClientDashboardProps {
  customer: Customer | undefined;
  tickets: Ticket[];
  invoices: Invoice[];
  currency: string;
  onCreateTicket: () => void;
  onPayBill: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  customer, 
  tickets, 
  invoices, 
  currency, 
  onCreateTicket,
  onPayBill
}) => {
  const activeTicketCount = tickets.filter(t => t.status !== TicketStatus.CLOSED).length;
  const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.PENDING || i.status === InvoiceStatus.OVERDUE);
  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Mock plan data if customer doesn't have one linked
  const planName = customer?.subscription_plan || 'Standard Fiber';
  const planPrice = 49.99; // Mock price if not available
  const planSpeed = '100 Mbps';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Hello, {customer?.name.split(' ')[0] || 'Subscriber'}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Welcome to your subscriber portal. Everything looks good today.
                </p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onCreateTicket}>
                    <AlertCircle className="w-4 h-4 mr-2" /> Report Issue
                </Button>
                {totalDue > 0 && (
                    <Button onClick={onPayBill} className="bg-indigo-600 hover:bg-indigo-700">
                        <CreditCard className="w-4 h-4 mr-2" /> Pay Bill ({formatCurrency(totalDue, currency)})
                    </Button>
                )}
            </div>
        </div>

        {/* Stats Grid */}
        <Grid cols={1} className="md:grid-cols-3" gap={6}>
            {/* Current Plan */}
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Wifi className="w-24 h-24" />
                </div>
                <CardContent className="p-6">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Current Plan</p>
                    <h3 className="text-2xl font-bold mb-4">{planName}</h3>
                    <Flex align="baseline" gap={2}>
                        <span className="text-3xl font-bold">{planSpeed}</span>
                        <span className="text-indigo-200">Unlimited Data</span>
                    </Flex>
                    <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                        <span className="text-sm font-medium text-indigo-100">Status: Active</span>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                            Auto-Renew
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Bill Status */}
            <Card>
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <Flex justify="between" align="start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Current Bill</p>
                            <p className={`text-3xl font-bold mt-1 ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(totalDue, currency)}
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${totalDue > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <FileText className="w-6 h-6" />
                        </div>
                    </Flex>
                    <div className="mt-4">
                        {totalDue > 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You have {unpaidInvoices.length} unpaid invoice(s). Please clear your dues to avoid interruption.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                All bills paid. Thank you!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Ticket Status */}
            <Card>
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <Flex justify="between" align="start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Support Tickets</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeTicketCount}</p>
                        </div>
                        <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 rounded-full">
                            <Activity className="w-6 h-6" />
                        </div>
                    </Flex>
                    <div className="mt-4">
                        {activeTicketCount > 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                We are working on your request. Expect an update soon.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                No open issues. Need help? Create a new ticket anytime.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Grid>

        <Grid cols={1} className="lg:grid-cols-2" gap={8}>
            {/* Usage Graph */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-500" /> Network Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <BandwidthMonitor planSpeed={planSpeed} />
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {invoices.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                {invoices.slice(0, 3).map(inv => (
                                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{inv.description || 'Monthly Service'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{new Date(inv.issued_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <InvoiceStatusBadge status={inv.status} />
                                            <span className="font-bold text-sm">{formatCurrency(inv.amount, currency)}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500 text-sm">No invoice history found.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tickets */}
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Your Tickets</CardTitle>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400" onClick={onCreateTicket}>
                        <Plus className="w-4 h-4 mr-1" /> New
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {tickets.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {tickets.slice(0, 5).map(ticket => (
                                <div key={ticket.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <Flex justify="between" align="start" className="mb-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{ticket.title}</h4>
                                        <TicketStatusBadge status={ticket.status} />
                                    </Flex>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{ticket.description}</p>
                                    <Flex justify="between" className="mt-2 text-xs text-gray-400">
                                        <span>#{ticket.id.slice(0, 8)}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </Flex>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white">No Tickets</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">You haven't reported any issues. Enjoy your seamless internet connection!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Grid>
    </div>
  );
};
