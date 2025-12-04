
import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Flex } from '../ui/flex';
import { useToast } from '../../contexts/ToastContext';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: 'credit_card' | 'bank_transfer'; last_four: string; expiry_date?: string; bank_name?: string }) => Promise<void>;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [methodType, setMethodType] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [lastFour, setLastFour] = useState('');
  const [expiry, setExpiry] = useState('');
  const [bankName, setBankName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastFour) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        type: methodType,
        last_four: lastFour,
        expiry_date: methodType === 'credit_card' ? expiry : undefined,
        bank_name: methodType === 'bank_transfer' ? bankName : undefined
      });
      setLastFour('');
      setExpiry('');
      setBankName('');
      toast.success("Payment method added.");
      onClose();
    } catch (e) {
      toast.error("Failed to add payment method.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="mb-2 block dark:text-gray-200">Type</Label>
                <Flex gap={4}>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300" checked={methodType === 'credit_card'} onChange={() => setMethodType('credit_card')} />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Credit Card</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300" checked={methodType === 'bank_transfer'} onChange={() => setMethodType('bank_transfer')} />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Bank Transfer</span>
                    </label>
                </Flex>
            </div>
            
            {methodType === 'bank_transfer' && (
                <div>
                    <Label className="mb-1 dark:text-gray-200">Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Chase" />
                </div>
            )}
            
            <div>
                <Label className="mb-1 dark:text-gray-200">Last 4 Digits</Label>
                <Input value={lastFour} onChange={(e) => setLastFour(e.target.value)} maxLength={4} placeholder="1234" />
            </div>
            
            {methodType === 'credit_card' && (
                <div>
                    <Label className="mb-1 dark:text-gray-200">Expiry Date</Label>
                    <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                </div>
            )}
            
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Add Method</Button>
            </DialogFooter>
        </form>
    </Dialog>
  );
};
