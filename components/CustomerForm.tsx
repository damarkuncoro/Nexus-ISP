import React, { useState } from 'react';
import { Customer, CustomerStatus, SubscriptionPlan, CustomerType, InstallationStatus } from '../types';
import { Save, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Grid } from './ui/grid';

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
         <Button 
           variant="ghost"
           onClick={onClose} 
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Subscribers
         </Button>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Add New Subscriber</CardTitle>
            <CardDescription>Register a new customer account in the system.</CardDescription>
          </CardHeader>
            
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <Label htmlFor="address">Service Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Fiber Optic Way, Tech City"
                />
              </div>

              <Grid cols={1} className="md:grid-cols-2" gap={6}>
                <div>
                  <Label htmlFor="plan">Subscription Plan</Label>
                  {hasPlans ? (
                    <Select
                      id="plan"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                    >
                      <option value="">-- Select Plan --</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({formatCurrency(plan.price, currency)})
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      disabled
                      placeholder="No plans defined"
                    />
                  )}
                  {!hasPlans && (
                      <p className="text-xs text-red-500 mt-1">Please add plans in Settings first.</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="status">Account Status</Label>
                <Select
                  id="status"
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as CustomerStatus)}
                >
                  <option value={CustomerStatus.ACTIVE}>Active</option>
                  <option value={CustomerStatus.PENDING}>Pending Installation</option>
                  <option value={CustomerStatus.SUSPENDED}>Suspended (Non-payment)</option>
                  <option value={CustomerStatus.CANCELLED}>Cancelled</option>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50/50">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Subscriber
                </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};
