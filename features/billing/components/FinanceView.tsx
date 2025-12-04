import React, { useEffect, useMemo, useState } from 'react';
import { Customer, SubscriptionPlan, InvoiceStatus } from '../../../types';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../../../utils/formatters';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Flex } from '../../../components/ui/flex';
import { Grid } from '../../../components/ui/grid';
import { EmptyState } from '../../../components/ui/empty-state';
import { useToast } from '../../../contexts/ToastContext';
import { DollarSign, Search, Clock, PlayCircle, FileText, Download, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { InvoiceStatusBadge } from '../../../components/StatusBadges';
import { downloadInvoice } from '../utils/invoiceGenerator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';

interface FinanceViewProps {
  customers: Customer[];
  plans: SubscriptionPlan[];
  currency: string;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ customers, plans, currency }) => {
  const { invoices, loadInvoices, runBillingCycle, markAsPaid, loading } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
        const customerName = (inv as any).customer?.name || '';
        const invoiceNum = inv.invoice_number;
        const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              invoiceNum.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const stats = useMemo(() => {
      return {
          totalRevenue: invoices.reduce((sum, inv) => inv.status === InvoiceStatus.PAID ? sum + inv.amount : sum, 0),
          pendingAmount: invoices.reduce((sum, inv) => inv.status === InvoiceStatus.PENDING ? sum + inv.amount : sum, 0),
          overdueAmount: invoices.reduce((sum, inv) => inv.status === InvoiceStatus.OVERDUE ? sum + inv.amount : sum, 0),
          count: invoices.length
      };
  }, [invoices]);

  const handleRunBatch = async () => {
      setIsProcessingBatch(true);
      try {
          const count = await runBillingCycle(customers, plans);
          if (count > 0) {
              toast.success(`Generated ${count} invoices successfully.`);
          } else {
              toast.info("No eligible customers found for billing.");
          }
      } catch (e: any) {
          toast.error(e.message || "Failed to run billing cycle");
      } finally {
          setIsProcessingBatch(false);
      }
  };

  const handleDownload = (invoice: any) => {
      const customer = {
          name: invoice.customer?.name || 'Unknown',
          email: invoice.customer?.email || '',
          company: invoice.customer?.company || '',
      } as Customer;
      
      downloadInvoice(invoice, customer, currency);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Grid cols={1} className="md:grid-cols-3" gap={6}>
            <Card className="bg-white border-l-4 border-l-emerald-500">
                <CardContent className="p-6">
                    <Flex justify="between" align="start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Collected Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue, currency)}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="w-6 h-6" /></div>
                    </Flex>
                </CardContent>
            </Card>
            <Card className="bg-white border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                    <Flex justify="between" align="start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.pendingAmount, currency)}</p>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-6 h-6" /></div>
                    </Flex>
                </CardContent>
            </Card>
            <Card className="bg-white border-l-4 border-l-red-500">
                <CardContent className="p-6">
                    <Flex justify="between" align="start">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.overdueAmount, currency)}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle className="w-6 h-6" /></div>
                    </Flex>
                </CardContent>
            </Card>
        </Grid>

        <Card>
            <CardHeader className="py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" /> Financial Records
                    </CardTitle>
                </div>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <PlayCircle className="w-4 h-4 mr-2" /> Run Monthly Batch
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Run Billing Cycle?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will generate new invoices for all <strong>{customers.filter(c => c.account_status === 'active' && c.plan_id).length}</strong> active subscribers based on their current plan. 
                                Are you sure you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRunBatch} disabled={isProcessingBatch}>
                                {isProcessingBatch ? 'Processing...' : 'Generate Invoices'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>

            <CardContent className="p-0">
                <Flex className="p-4 border-b border-gray-100 bg-gray-50 gap-4 flex-col sm:flex-row">
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <Input className="pl-10" placeholder="Search invoice or subscriber..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                            <option value="all">All Statuses</option>
                            <option value={InvoiceStatus.PAID}>Paid</option>
                            <option value={InvoiceStatus.PENDING}>Pending</option>
                            <option value={InvoiceStatus.OVERDUE}>Overdue</option>
                            <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
                        </Select>
                    </div>
                </Flex>

                {filteredInvoices.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Subscriber</TableHead>
                                <TableHead>Date Issued</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((inv: any) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-xs font-medium">{inv.invoice_number}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{inv.customer?.name || 'Unknown'}</div>
                                        {inv.customer?.company && <div className="text-xs text-gray-500">{inv.customer.company}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Flex align="center" gap={2} className="text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(inv.issued_date).toLocaleDateString()}
                                        </Flex>
                                    </TableCell>
                                    <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(inv.amount, currency)}</TableCell>
                                    <TableCell className="text-right">
                                        <Flex justify="end" gap={2}>
                                            <Button variant="ghost" size="icon" onClick={() => handleDownload(inv)} title="Download PDF">
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            {inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED && (
                                                <Button variant="ghost" size="icon" onClick={() => markAsPaid(inv.id)} title="Mark as Paid" className="hover:text-green-600">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </Flex>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="p-12">
                        <EmptyState 
                            icon={FileText} 
                            title="No invoices found" 
                            message="Adjust your filters or run a billing cycle to generate invoices."
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};