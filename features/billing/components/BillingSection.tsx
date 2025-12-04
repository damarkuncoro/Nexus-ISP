
import React, { useEffect, useState } from 'react';
import { Customer, Invoice, InvoiceStatus, SubscriptionPlan, EmployeeRole } from '../../../types';
import { useBilling } from '../hooks/useBilling';
import { formatCurrency } from '../../../utils/formatters';
import { FileText, CreditCard, Plus, Download, Landmark } from 'lucide-react';
import { InvoiceStatusBadge } from '../../../components/StatusBadges';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { downloadInvoice } from '../utils/invoiceGenerator';
import { PaymentMethodModal } from './PaymentMethodModal';
import { Grid, GridItem } from '../../../components/ui/grid';
import { Flex } from '../../../components/ui/flex';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

interface BillingSectionProps {
  customer: Customer;
  currency: string;
  plans: SubscriptionPlan[];
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const BillingSection: React.FC<BillingSectionProps> = ({ customer, currency, plans }) => {
  const toast = useToast();
  const { currentUser } = useAuth();
  const { 
    invoices, 
    paymentMethods, 
    loadBillingData, 
    createNewInvoice,
    updateStatus,
    addMethod 
  } = useBilling(customer.id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const currentPlan = plans.find(p => p.id === customer.plan_id);
  const isCustomerView = currentUser?.role === EmployeeRole.CUSTOMER;

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleGenerateInvoice = async () => {
    const amount = currentPlan ? currentPlan.price : 0;
    const description = currentPlan 
        ? `Monthly Subscription: ${currentPlan.name}` 
        : 'Ad-hoc Service Charge';
        
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    setIsGenerating(true);
    try {
      await createNewInvoice(amount, dueDate, description);
      toast.success("Invoice generated successfully!");
    } catch (e) {
      toast.error("Failed to generate invoice.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: InvoiceStatus) => {
    try {
      await updateStatus(id, newStatus);
      if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice(prev => prev ? ({...prev, status: newStatus}) : null);
      }
      toast.success(`Invoice marked as ${newStatus}.`);
    } catch (err) {
        toast.error("Failed to update invoice status.");
        console.error(err);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
      // Simulate Payment Gateway
      toast.info("Redirecting to secure payment gateway...");
      setTimeout(() => {
          handleUpdateStatus(invoice.id, InvoiceStatus.PAID);
          toast.success("Payment successful! Invoice cleared.");
      }, 1500);
  };

  const handleAddMethod = async (data: { type: 'credit_card' | 'bank_transfer'; last_four: string; expiry_date?: string; bank_name?: string }) => {
      await addMethod(data);
  };

  return (
    <Grid cols={1} className="lg:grid-cols-3" gap={6}>
      <GridItem className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <Flex justify="between" align="center" className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <Flex align="center" gap={3}>
                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing History & Invoices</h3>
                </Flex>
                {!isCustomerView && (
                    <Button size="sm" onClick={handleGenerateInvoice} isLoading={isGenerating}>
                        <Plus className="w-3 h-3 mr-1" />
                        Generate Invoice
                    </Button>
                )}
            </Flex>

            {invoices.length === 0 ? (
                <div className="p-6">
                    <EmptyState 
                        icon={FileText}
                        title="No invoices found"
                        message={isCustomerView ? "You have no invoices yet." : "Generate the first invoice for this customer to get started."}
                    />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Issued</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="cursor-pointer">
                                <TableCell className="font-medium text-primary-600 dark:text-primary-400">{invoice.invoice_number}</TableCell>
                                <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                                <TableCell>{formatDate(invoice.issued_date)}</TableCell>
                                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, currency)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); downloadInvoice(invoice, customer, currency); }}>
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        {isCustomerView && invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED && (
                                            <Button size="sm" className="h-8 px-2" onClick={(e) => { e.stopPropagation(); handlePayInvoice(invoice); }}>
                                                Pay
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
      </GridItem>
      <GridItem>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <Flex justify="between" align="center" className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <Flex align="center" gap={3}>
                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h3>
                </Flex>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                </Button>
            </Flex>
            <div className="p-6 space-y-4">
                {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                    <Flex key={pm.id} justify="between" align="center" className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                        <Flex align="center" gap={3}>
                            <Landmark className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{pm.type === 'bank_transfer' ? pm.bank_name : 'Credit Card'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">**** **** **** {pm.last_four}</p>
                            </div>
                        </Flex>
                        {pm.is_default && <Badge variant="success">Default</Badge>}
                    </Flex>
                )) : (
                    <EmptyState 
                        icon={CreditCard}
                        title="No payment methods"
                        message="Add a payment method for easier billing."
                    />
                )}
            </div>
        </div>
      </GridItem>

      {selectedInvoice && (
          <InvoiceDetailModal 
            invoice={selectedInvoice} 
            customer={customer}
            currency={currency}
            onClose={() => setSelectedInvoice(null)}
            onUpdateStatus={handleUpdateStatus}
            onDownload={(inv) => downloadInvoice(inv, customer, currency)}
            isCustomerView={isCustomerView}
            onPay={() => handlePayInvoice(selectedInvoice)}
          />
      )}

      {showAddModal && (
          <PaymentMethodModal 
            isOpen={showAddModal} 
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddMethod}
          />
      )}
    </Grid>
  );
};
