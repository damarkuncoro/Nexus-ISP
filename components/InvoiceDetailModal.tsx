import React from 'react';
import { Invoice, Customer, InvoiceStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import { InvoiceStatusBadge } from './StatusBadges';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  customer: Customer;
  currency: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDownload: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, customer, currency, onClose, onUpdateStatus, onDownload }) => {
  
  const handleCancel = () => {
      if (window.confirm("Are you sure you want to cancel this invoice? This action cannot be undone.")) {
          onUpdateStatus(invoice.id, InvoiceStatus.CANCELLED);
      }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog isOpen={true} onClose={onClose} className="max-w-2xl">
        <DialogHeader className="flex flex-row justify-between items-center border-b border-gray-100 pb-4 mb-0">
             <div>
                <DialogTitle>Invoice Details</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">{invoice.invoice_number}</p>
             </div>
        </DialogHeader>

        <div className="py-6">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h1>
                  <InvoiceStatusBadge status={invoice.status} />
               </div>
               <div className="text-right space-y-1">
                  <div className="flex justify-between gap-8 text-sm">
                     <span className="text-gray-500">Issued Date:</span>
                     <span className="font-medium text-gray-900">{formatDate(invoice.issued_date)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm">
                     <span className="text-gray-500">Due Date:</span>
                     <span className={`font-medium ${invoice.status === InvoiceStatus.OVERDUE ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(invoice.due_date)}
                     </span>
                  </div>
               </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-8 mb-8">
               <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h4>
                  <div className="text-sm text-gray-900 font-medium">{customer.name}</div>
                  {customer.company && <div className="text-sm text-gray-600">{customer.company}</div>}
                  {customer.address && <div className="text-sm text-gray-600">{customer.address}</div>}
                  <div className="text-sm text-gray-600 mt-1">{customer.email}</div>
               </div>
               <div className="text-right">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pay To</h4>
                  <div className="text-sm text-gray-900 font-medium">Nexus ISP Solutions</div>
                  <div className="text-sm text-gray-600">123 Network Blvd, Suite 400</div>
                  <div className="text-sm text-gray-600">Tech City, TC 90210</div>
                  <div className="text-sm text-gray-600 mt-1">billing@nexus-isp.com</div>
               </div>
            </div>

            <div className="mb-6">
               <table className="min-w-full">
                  <thead>
                     <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Description</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     <tr>
                        <td className="py-4 text-sm text-gray-900">{invoice.description || 'Internet Services'}</td>
                        <td className="py-4 text-right text-sm text-gray-900 font-mono">{formatCurrency(invoice.amount, currency)}</td>
                     </tr>
                  </tbody>
                  <tfoot>
                     <tr>
                        <td className="pt-6 text-right text-sm font-medium text-gray-900">Total</td>
                        <td className="pt-6 text-right text-2xl font-bold text-gray-900">{formatCurrency(invoice.amount, currency)}</td>
                     </tr>
                  </tfoot>
               </table>
            </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
             <div className="flex gap-2 w-full sm:w-auto">
                 <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" /> Print
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => onDownload(invoice)}>
                    <Download className="w-4 h-4 mr-2" /> Download
                 </Button>
             </div>
             
             <div className="flex gap-2 w-full sm:w-auto justify-end">
                {invoice.status === InvoiceStatus.PENDING || invoice.status === InvoiceStatus.OVERDUE ? (
                   <>
                      <Button variant="destructive" size="sm" onClick={handleCancel}>
                         Cancel
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(invoice.id, InvoiceStatus.PAID)}>
                         Mark Paid
                      </Button>
                   </>
                ) : null}
                
                {invoice.status === InvoiceStatus.PAID && (
                   <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Paid on {formatDate(invoice.issued_date)}
                   </span>
                )}
             </div>
        </div>
    </Dialog>
  );
};