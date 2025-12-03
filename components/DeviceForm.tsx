import React, { useState, useEffect } from 'react';
import { NetworkDevice, DeviceType, DeviceStatus } from '../types';
import { Save, Server, Cpu, ArrowLeft } from 'lucide-react';

interface DeviceFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: NetworkDevice;
  customerId?: string;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ onClose, onSubmit, initialData, customerId }) => {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [type, setType] = useState<DeviceType>(DeviceType.ROUTER);
  const [status, setStatus] = useState<DeviceStatus>(DeviceStatus.ONLINE);
  const [location, setLocation] = useState('');
  
  // Technical Specs
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIpAddress(initialData.ip_address || '');
      setType(initialData.type);
      setStatus(initialData.status);
      setLocation(initialData.location || '');
      // Tech Specs
      setModel(initialData.model || '');
      setSerialNumber(initialData.serial_number || '');
      setFirmwareVersion(initialData.firmware_version || '');
    } else {
      setName('');
      setIpAddress('');
      setType(customerId ? DeviceType.CPE : DeviceType.ROUTER);
      setStatus(DeviceStatus.ONLINE);
      setLocation(customerId ? 'Customer Premises' : '');
      setModel('');
      setSerialNumber('');
      setFirmwareVersion('');
    }
  }, [initialData, customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        ip_address: ipAddress,
        type,
        status,
        location,
        model,
        serial_number: serialNumber,
        firmware_version: firmwareVersion,
        customer_id: customerId
      });
      // onClose handled by parent
    } catch (err) {
      // Handled by parent
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
             <ArrowLeft className="w-5 h-5 mr-2" /> Back
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
                {initialData ? 'Edit Network Device' : customerId ? 'Add Subscriber Device' : 'Add Network Device'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Manage hardware inventory and configuration details.</p>
          </div>
            
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Server className="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     type="text"
                     required
                     className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg border p-2.5"
                     placeholder={customerId ? "e.g. Living Room Router" : "e.g. Core Router 01"}
                     value={name}
                     onChange={e => setName(e.target.value)}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg border p-2.5"
                  placeholder="192.168.1.1"
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      className="mt-1 block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={type}
                      onChange={e => setType(e.target.value as DeviceType)}
                    >
                      <option value={DeviceType.CPE}>CPE / Access Point</option>
                      <option value={DeviceType.ROUTER}>Router</option>
                      <option value={DeviceType.SWITCH}>Switch</option>
                      <option value={DeviceType.OLT}>OLT</option>
                      <option value={DeviceType.SERVER}>Server</option>
                      <option value={DeviceType.OTHER}>Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="mt-1 block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={status}
                      onChange={e => setStatus(e.target.value as DeviceStatus)}
                    >
                      <option value={DeviceStatus.ONLINE}>Online</option>
                      <option value={DeviceStatus.OFFLINE}>Offline</option>
                      <option value={DeviceStatus.WARNING}>Warning</option>
                      <option value={DeviceStatus.MAINTENANCE}>Maintenance</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                <input
                  type="text"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg border p-2.5"
                  placeholder={customerId ? "e.g. Installation Address" : "Data Center A, Rack 2"}
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                 <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-500" />
                    Technical Specifications
                 </h4>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
                        <input
                            type="text"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-xs border-gray-300 rounded-lg border p-2.5"
                            placeholder="e.g. MikroTik RB4011"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Serial Number</label>
                        <input
                            type="text"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-xs border-gray-300 rounded-lg border p-2.5"
                            placeholder="e.g. SN-12345678"
                            value={serialNumber}
                            onChange={e => setSerialNumber(e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Firmware Version</label>
                        <input
                            type="text"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-xs border-gray-300 rounded-lg border p-2.5"
                            placeholder="e.g. v6.48.6 (Long-term)"
                            value={firmwareVersion}
                            onChange={e => setFirmwareVersion(e.target.value)}
                        />
                    </div>
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
                      Save Device
                    </>
                  )}
                </button>
            </div>
          </form>
      </div>
    </div>
  );
};