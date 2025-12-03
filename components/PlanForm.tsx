import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../types';
import { Save, Wifi, ArrowLeft } from 'lucide-react';

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
      // onClose usually triggered by parent update
    } catch (err) {
      // Error handled by parent
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
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Plans
         </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
                {initialData ? 'Edit Service Plan' : 'Add New Service Plan'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Configure plan details, pricing, and speed limits.</p>
          </div>
            
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wifi className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fiber Ultra"
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg border p-2.5"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">{currency === 'USD' ? '$' : currency}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="block w-full rounded-lg border-gray-300 pl-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2.5"
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Download Speed</label>
                  <input
                    type="text"
                    placeholder="100 Mbps"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2.5"
                    value={downloadSpeed}
                    onChange={e => setDownloadSpeed(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Speed</label>
                  <input
                    type="text"
                    placeholder="20 Mbps"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2.5"
                    value={uploadSpeed}
                    onChange={e => setUploadSpeed(e.target.value)}
                  />
                </div>
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
                  className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan
                    </>
                  )}
                </button>
            </div>
          </form>
      </div>
    </div>
  );
};