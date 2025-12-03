import React, { useState, useEffect } from 'react';
import { NetworkDevice, DeviceType, DeviceStatus } from '../../types';
import { Save, Server, Cpu, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Grid } from '../ui/grid';

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
             <ArrowLeft className="w-5 h-5 mr-2" /> Back
         </Button>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Network Device' : customerId ? 'Add Subscriber Device' : 'Add Network Device'}</CardTitle>
            <CardDescription>Manage hardware inventory and configuration details.</CardDescription>
          </CardHeader>
            
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <div className="relative mt-1">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Server className="h-4 w-4 text-gray-400" /></div>
                   <Input id="device-name" required className="pl-10" placeholder={customerId ? "e.g. Living Room Router" : "e.g. Core Router 01"} value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="ip">IP Address</Label>
                <Input id="ip" placeholder="192.168.1.1" value={ipAddress} onChange={e => setIpAddress(e.target.value)} />
              </div>

              <Grid cols={2} gap={6}>
                 <div>
                    <Label htmlFor="type">Type</Label>
                    <Select id="type" value={type} onChange={e => setType(e.target.value as DeviceType)}>
                      <option value={DeviceType.CPE}>CPE / Access Point</option>
                      <option value={DeviceType.ROUTER}>Router</option>
                      <option value={DeviceType.SWITCH}>Switch</option>
                      <option value={DeviceType.OLT}>OLT</option>
                      <option value={DeviceType.SERVER}>Server</option>
                      <option value={DeviceType.OTHER}>Other</option>
                    </Select>
                 </div>
                 <div>
                    <Label htmlFor="status">Status</Label>
                    <Select id="status" value={status} onChange={e => setStatus(e.target.value as DeviceStatus)}>
                      <option value={DeviceStatus.ONLINE}>Online</option>
                      <option value={DeviceStatus.OFFLINE}>Offline</option>
                      <option value={DeviceStatus.WARNING}>Warning</option>
                      <option value={DeviceStatus.MAINTENANCE}>Maintenance</option>
                    </Select>
                 </div>
              </Grid>

              <div>
                <Label htmlFor="location">Physical Location</Label>
                <Input id="location" placeholder={customerId ? "e.g. Installation Address" : "Data Center A, Rack 2"} value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              <div className="border-t border-gray-100 pt-6">
                 <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-gray-500" />Technical Specifications</h4>
                 <Grid cols={2} gap={6}>
                    <div>
                        <Label htmlFor="model" className="text-xs">Model</Label>
                        <Input id="model" className="text-xs" placeholder="e.g. MikroTik RB4011" value={model} onChange={e => setModel(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="serial" className="text-xs">Serial Number</Label>
                        <Input id="serial" className="text-xs" placeholder="e.g. SN-12345678" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="firmware" className="text-xs">Firmware Version</Label>
                        <Input id="firmware" className="text-xs" placeholder="e.g. v6.48.6 (Long-term)" value={firmwareVersion} onChange={e => setFirmwareVersion(e.target.value)} />
                    </div>
                 </Grid>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50/50">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}><Save className="w-4 h-4 mr-2" /> Save Device</Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};
