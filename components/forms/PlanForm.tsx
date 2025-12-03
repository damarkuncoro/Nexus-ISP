import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { Save, Wifi, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface PlanFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<SubscriptionPlan, 'id' | 'created_at'>) => Promise<void>;
  initialData?: SubscriptionPlan;
  currency: string;
}

export const PlanForm: React.FC<PlanFormProps> = ({ onClose, onSubmit, initialData, currency }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setDownloadSpeed(initialData.download_speed);
      setUploadSpeed(initialData.upload_speed);
    } else {
      setName('');
      setPrice('');
      setDownloadSpeed('');
      setUploadSpeed('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        price: parseFloat(price),
        download_speed: downloadSpeed,
        upload_speed: uploadSpeed
      });
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
         <Button 
           variant="ghost"
           onClick={onClose} 
           className="text-gray-600 hover:text-gray-900 pl-0"
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Plans
         </Button>
      </div>
      
      <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Service Plan' : 'Add New Service Plan'}</CardTitle>
            <CardDescription>Configure plan details, pricing, and speed limits.</CardDescription>
          </CardHeader>
            
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-1 block">Plan Name</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wifi className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    required
                    placeholder="e.g. Fiber Ultra"
                    className="pl-10"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-1 block">Monthly Price</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">{currency === 'USD' ? '$' : currency}</span>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    className="pl-12"
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="mb-1 block">Download Speed</Label>
                  <Input
                    type="text"
                    placeholder="100 Mbps"
                    value={downloadSpeed}
                    onChange={e => setDownloadSpeed(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Upload Speed</Label>
                  <Input
                    type="text"
                    placeholder="20 Mbps"
                    value={uploadSpeed}
                    onChange={e => setUploadSpeed(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50 border-t border-gray-100 py-4 px-6">
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
                  Save Plan
                </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};