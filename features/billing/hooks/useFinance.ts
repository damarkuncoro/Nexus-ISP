
import { useState, useCallback } from 'react';
import { Invoice, Customer, SubscriptionPlan, InvoiceStatus, CustomerStatus } from '../../../types';
import { fetchAllInvoices, createBulkInvoices, updateInvoiceStatus } from '../services/billingService';
import { getSafeErrorMessage } from '../../../utils/errorHelpers';

export const useFinance = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load global invoices", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const runBillingCycle = async (customers: Customer[], plans: SubscriptionPlan[]) => {
    try {
        const eligibleCustomers = customers.filter(c => 
            c.account_status === CustomerStatus.ACTIVE && 
            c.plan_id
        );

        if (eligibleCustomers.length === 0) return 0;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); 
        const issuedDate = new Date().toISOString();
        const batchId = Date.now().toString().slice(-4);

        const newInvoices = eligibleCustomers.map((customer, index) => {
            const plan = plans.find(p => p.id === customer.plan_id);
            const amount = plan ? plan.price : 0;
            
            return {
                customer_id: customer.id,
                invoice_number: `INV-${new Date().getFullYear()}${new Date().getMonth() + 1}-${batchId}-${index}`,
                amount,
                status: InvoiceStatus.PENDING,
                issued_date: issuedDate,
                due_date: dueDate.toISOString(),
                description: `Monthly Subscription: ${plan?.name || 'Service'}`,
            };
        });

        await createBulkInvoices(newInvoices);
        await loadInvoices(); 
        return newInvoices.length;
    } catch (err) {
        throw new Error(getSafeErrorMessage(err));
    }
  };

  const markAsPaid = async (id: string) => {
      try {
          const updated = await updateInvoiceStatus(id, InvoiceStatus.PAID);
          setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      } catch (err) {
          throw new Error(getSafeErrorMessage(err));
      }
  };

  return {
    invoices,
    loading,
    error,
    loadInvoices,
    runBillingCycle,
    markAsPaid
  };
};
