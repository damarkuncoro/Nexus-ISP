import React, { useEffect, useState } from 'react';
import { Customer, Invoice, InvoiceStatus, SubscriptionPlan } from '../types';
import { useBilling } from '../hooks/useBilling';
import { formatCurrency } from '../utils/formatters';
import { FileText, CreditCard, Plus, Download, Landmark } from 'lucide-react';
import { InvoiceStatusBadge } from './StatusBadges';
import { InvoiceDetailModal } from './modals/InvoiceDetailModal';
import { downloadInvoice } from '../utils/invoiceGenerator';
import { PaymentMethodModal } from './modals/PaymentMethodModal';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { EmptyState } from './ui/empty-state';
import { useToast } from '../contexts/ToastContext';

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

  const handleAddMethod = async (data: { type: 'credit_card' | 'bank_transfer'; last_four: string; expiry_date?: string; bank_name?: string }) => {
      await addMethod(data);
  };

  return (
    <Grid cols={1} className="lg:grid-cols-3" gap={6}>
      <GridItem className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Flex justify="between" align="center" className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <Flex align="center" gap={3}>
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900">Billing History & Invoices</h3>
                </Flex>
                <Button size="sm" onClick={handleGenerateInvoice} isLoading={isGenerating}>
                    <Plus className="w-3 h-3 mr-1" />
                    Generate Invoice
                </Button>
            </Flex>

            {invoices.length === 0 ? (
                <div className="p-6">
                    <EmptyState 
                        icon={FileText}
                        title="No invoices found"
                        message="Generate the first invoice for this customer to get started."
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
                                <TableCell className="font-medium text-primary-600">{invoice.invoice_number}</TableCell>
                                <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                                <TableCell>{formatDate(invoice.issued_date)}</TableCell>
                                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, currency)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); downloadInvoice(invoice, customer, currency); }}>
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
      </GridItem>
      <GridItem>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Flex justify="between" align="center" className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <Flex align="center" gap={3}>
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
                </Flex>
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                </Button>
            </Flex>
            <div className="p-6 space-y-4">
                {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                    <Flex key={pm.id} justify="between" align="center" className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Flex align="center" gap={3}>
                            <Landmark className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{pm.type === 'bank_transfer' ? pm.bank_name : 'Credit Card'}</p>
                                <p className="text-xs text-gray-500">**** **** **** {pm.last_four}</p>
                            </div>
                        </Flex>
                        {pm.is_default && <Badge variant="success">Default</Badge>}
                    </Flex>
                )) : (
                    <EmptyState 
                        icon={CreditCard}
                        title="No payment methods"
                        message="Add a payment method for this customer."
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
