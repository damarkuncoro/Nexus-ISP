import React from 'react';
import { Invoice, Customer, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import { InvoiceStatusBadge } from '../StatusBadges';
import { Dialog, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Grid } from '../ui/grid';
import { Flex } from '../ui/flex';
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from '../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  customer: Customer;
  currency: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDownload: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, customer, currency, onClose, onUpdateStatus, onDownload }) => {
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog isOpen={true} onClose={onClose} className="max-w-2xl">
        <DialogHeader>
             <div>
                <DialogTitle>Invoice Details</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">{invoice.invoice_number}</p>
             </div>
        </DialogHeader>

        <div className="py-6">
            <Flex justify="between" align="start" className="mb-8">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h1>
                  <InvoiceStatusBadge status={invoice.status} />
               </div>
               <div className="text-right space-y-1">
                  <Flex justify="between" gap={8} className="text-sm">
                     <span className="text-gray-500">Issued Date:</span>
                     <span className="font-medium text-gray-900">{formatDate(invoice.issued_date)}</span>
                  </Flex>
                  <Flex justify="between" gap={8} className="text-sm">
                     <span className="text-gray-500">Due Date:</span>
                     <span className={`font-medium ${invoice.status === InvoiceStatus.OVERDUE ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(invoice.due_date)}
                     </span>
                  </Flex>
               </div>
            </Flex>

            <Separator className="my-6" />

            <Grid cols={2} gap={8} className="mb-8">
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
            </Grid>

            <div className="mb-6">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     <TableRow>
                        <TableCell className="font-medium">{invoice.description || 'Internet Services'}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(invoice.amount, currency)}</TableCell>
                     </TableRow>
                  </TableBody>
                  <TableFooter>
                     <TableRow>
                        <TableCell className="text-right font-bold text-lg">Total</TableCell>
                        <TableCell className="text-right font-bold text-2xl">{formatCurrency(invoice.amount, currency)}</TableCell>
                     </TableRow>
                  </TableFooter>
               </Table>
            </div>
        </div>

        <Flex direction="col-reverse" justify="between" align="center" className="sm:flex-row" gap={4}>
             <Flex gap={2} className="w-full sm:w-auto">
                 <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" /> Print
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => onDownload(invoice)}>
                    <Download className="w-4 h-4 mr-2" /> Download
                 </Button>
             </Flex>
             
             <Flex gap={2} justify="end" className="w-full sm:w-auto">
                {invoice.status === InvoiceStatus.PENDING || invoice.status === InvoiceStatus.OVERDUE ? (
                   <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">Cancel</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Invoice?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark the invoice as cancelled. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Invoice</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onUpdateStatus(invoice.id, InvoiceStatus.CANCELLED)}>
                              Confirm Cancellation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

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
             </Flex>
        </Flex>
    </Dialog>
  );
};
