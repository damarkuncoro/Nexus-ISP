import React, { useEffect, useState } from 'react';
import { Customer, Invoice, InvoiceStatus, SubscriptionPlan } from '../types';
import { useBilling } from '../hooks/useBilling';
import { formatCurrency } from '../utils/formatters';
import { FileText, CreditCard, Plus, Download, AlertCircle, Landmark } from 'lucide-react';
import { InvoiceStatusBadge } from './StatusBadges';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { downloadInvoice } from '../utils/invoiceGenerator';
import { PaymentMethodModal } from './PaymentMethodModal';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';

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
    } catch (e) {
      alert("Failed to generate invoice");
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
    } catch (e) {
      alert("Failed to update invoice status");
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    downloadInvoice(invoice, customer, currency);
  };

  const totalDue = invoices
    .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE)
    .reduce((sum, inv) => sum + inv.amount, 0);

  const lastInvoice = invoices[0];

  const isOverdue = (invoice: Invoice) => {
      const due = new Date(invoice.due_date);
      const now = new Date();
      return due < now && invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED;
  };

  return (
    <div className="space-y-6">
      <Grid cols={1} className="md:grid-cols-3" gap={4}>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Amount Due</p>
          <p className={`text-2xl font-bold mt-1 ${totalDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(totalDue, currency)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Last Invoice</p>
          <Flex align="center" justify="between" className="mt-1">
             <p className="text-lg font-bold text-gray-900">
               {lastInvoice ? formatCurrency(lastInvoice.amount, currency) : 'N/A'}
             </p>
             {lastInvoice && <InvoiceStatusBadge status={lastInvoice.status} />}
          </Flex>
          {lastInvoice && <p className="text-xs text-gray-400 mt-1">Issued: {formatDate(lastInvoice.issued_date)}</p>}
        </div>
        <Flex align="center" justify="between" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div>
              <p className="text-sm font-medium text-gray-500">Active Plan</p>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {currentPlan ? currentPlan.name : (customer.subscription_plan || 'No Plan')}
              </p>
           </div>
           <div className="bg-primary-50 p-2 rounded-lg">
             <FileText className="w-5 h-5 text-primary-600" />
           </div>
        </Flex>
      </Grid>

      <Grid cols={1} className="lg:grid-cols-3" gap={6}>
        <GridItem className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Flex align="center" justify="between" className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
            <button 
              onClick={handleGenerateInvoice}
              disabled={isGenerating}
              className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate New Invoice'}
            </button>
          </Flex>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Details</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                    No invoices found. Generate one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className="group cursor-pointer"
                  >
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{inv.invoice_number}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]" title={inv.description}>
                          {inv.description || 'General Service'}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inv.issued_date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                       <Flex align="center" gap={1} className={isOverdue(inv) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                           {formatDate(inv.due_date)}
                           {isOverdue(inv) && <AlertCircle className="w-3 h-3" />}
                       </Flex>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(inv.amount, currency)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right">
                       <Flex justify="end" gap={2} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                             onClick={(e) => {
                                 e.stopPropagation();
                                 handleDownloadInvoice(inv);
                             }}
                             className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200"
                             title="Download Invoice"
                          >
                             <Download className="w-3 h-3" />
                          </button>

                          {inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE ? (
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(inv.id, InvoiceStatus.PAID);
                                  }}
                                  className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded border border-green-200"
                              >
                                  Mark Paid
                              </button>
                          ) : null}
                          {inv.status !== InvoiceStatus.CANCELLED && inv.status !== InvoiceStatus.PAID && (
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm("Cancel Invoice?")) handleUpdateStatus(inv.id, InvoiceStatus.CANCELLED);
                                  }}
                                  className="text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded border border-gray-200"
                              >
                                  Cancel
                              </button>
                          )}
                       </Flex>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </GridItem>

        <GridItem className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Flex align="center" justify="between" className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
                <button onClick={() => setShowAddModal(true)} className="text-gray-400 hover:text-gray-600">
                   <Plus className="w-5 h-5" />
                </button>
              </Flex>
              <div className="p-4 space-y-3">
                 {paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No payment methods saved.</p>
                 ) : (
                    paymentMethods.map(pm => (
                       <Flex align="center" justify="between" key={pm.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <Flex align="center" gap={3}>
                             <div className="p-2 bg-white rounded border border-gray-200 text-gray-600">
                                {pm.type === 'bank_transfer' ? (
                                    <Landmark className="w-5 h-5" />
                                ) : (
                                    <CreditCard className="w-5 h-5" />
                                )}
                             </div>
                             <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {pm.type === 'bank_transfer' ? pm.bank_name || 'Bank Account' : 'Credit Card'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {pm.type === 'bank_transfer' ? 'Acct ending ' : 'Ending '} •••• {pm.last_four}
                                </p>
                             </div>
                          </Flex>
                          {pm.is_default && (
                             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                          )}
                       </Flex>
                    ))
                 )}
              </div>
           </div>
        </GridItem>
      </Grid>

      {selectedInvoice && (
        <InvoiceDetailModal 
            invoice={selectedInvoice}
            customer={customer}
            currency={currency}
            onClose={() => setSelectedInvoice(null)}
            onUpdateStatus={handleUpdateStatus}
            onDownload={handleDownloadInvoice}
        />
      )}

      {showAddModal && (
        <PaymentMethodModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={async (data) => { await addMethod(data); }}
        />
      )}
    </div>
  );
};