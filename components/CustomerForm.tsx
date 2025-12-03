import React, { useState } from 'react';
import { Customer, CustomerStatus, SubscriptionPlan, CustomerType, InstallationStatus } from '../types';
import { Save, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CustomerFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
  plans?: SubscriptionPlan[];
  currency: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onClose, onSubmit, plans = [], currency }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [accountStatus, setAccountStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPlans = plans && plans.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    try {
      await onSubmit({ 
        name, 
        email, 
        phone,
        type: CustomerType.RESIDENTIAL, // Default for simple form
        installation_status: InstallationStatus.INSTALLED, // Default for simple form
        company: company || undefined,
        address: address || undefined,
        plan_id: selectedPlanId || undefined,
        subscription_plan: selectedPlan ? selectedPlan.name : undefined,
        account_status: accountStatus
      });
      // Cleanup usually handled by parent changing view
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
         <button 
           onClick={onClose} 
           className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Subscribers
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Add New Subscriber</h3>
            <p className="text-sm text-gray-500 mt-1">Register a new customer account in the system.</p>
          </div>
            
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Service Address</label>
                <input
                  type="text"
                  id="address"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Fiber Optic Way, Tech City"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                  {hasPlans ? (
                    <select
                      id="plan"
                      className="mt-1 block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                    >
                      <option value="">-- Select Plan --</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({formatCurrency(plan.price, currency)})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="No plans defined"
                      className="mt-1 block w-full bg-gray-100 rounded-lg border-gray-300 shadow-sm sm:text-sm border p-2.5"
                    />
                  )}
                  {!hasPlans && (
                      <p className="text-xs text-red-500 mt-1">Please add plans in Settings first.</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company (Optional)</label>
                  <input
                    type="text"
                    id="company"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Account Status</label>
                <select
                  id="status"
                  className="mt-1 block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as CustomerStatus)}
                >
                  <option value={CustomerStatus.ACTIVE}>Active</option>
                  <option value={CustomerStatus.PENDING}>Pending Installation</option>
                  <option value={CustomerStatus.SUSPENDED}>Suspended (Non-payment)</option>
                  <option value={CustomerStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Subscriber
                    </>
                  )}
                </button>
            </div>
          </form>
      </div>
    </div>
  );
};