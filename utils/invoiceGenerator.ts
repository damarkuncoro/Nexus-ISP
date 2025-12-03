import { Invoice, Customer } from '../types';
import { formatCurrency } from './formatters';

export const generateInvoiceHtml = (invoice: Invoice, customer: Customer, currency: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #111827; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #0284c7; display: flex; align-items: center; gap: 10px; }
        .invoice-details { text-align: right; }
        .invoice-details h1 { margin: 0; font-size: 32px; color: #111827; letter-spacing: -1px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; }
        td { border-bottom: 1px solid #e5e7eb; padding: 16px 0; font-size: 14px; }
        .amount-col { text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .total-row td { border-top: 2px solid #111827; border-bottom: none; padding-top: 20px; font-weight: 700; font-size: 18px; }
        .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #9ca3af; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Nexus ISP</div>
        <div class="invoice-details">
          <h1>INVOICE</h1>
          <p>#${invoice.invoice_number}</p>
        </div>
      </div>
      <div>
          <strong>Bill To:</strong><br/>
          ${customer.name}<br/>
          ${customer.email}
      </div>
      <br/><br/>
      <table>
        <thead><tr><th>Description</th><th class="amount-col">Amount</th></tr></thead>
        <tbody>
          <tr><td>${invoice.description || 'Service'}</td><td class="amount-col">${formatCurrency(invoice.amount, currency)}</td></tr>
          <tr class="total-row"><td>Total</td><td class="amount-col">${formatCurrency(invoice.amount, currency)}</td></tr>
        </tbody>
      </table>
      <div class="footer"><p>Thank you for your business.</p></div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;
};

export const downloadInvoice = (invoice: Invoice, customer: Customer, currency: string) => {
    const htmlContent = generateInvoiceHtml(invoice, customer, currency);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoice_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
