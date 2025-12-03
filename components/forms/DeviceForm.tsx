
import React, { useState, useEffect } from 'react';
import { NetworkDevice, DeviceType, DeviceStatus } from '../../types';
import { Save, Server, Cpu, ArrowLeft, Info, Settings, Globe, Hash, Key, Network, Sliders, Package, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Grid } from '../ui/grid';
import { Flex } from '../ui/flex';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useInventory } from '../../hooks/useInventory';

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
  const [macAddress, setMacAddress] = useState('');
  const [vlanId, setVlanId] = useState('');
  const [pppoeUsername, setPppoeUsername] = useState('');

  // Inventory Integration
  const { items: inventoryItems, loadInventory, adjustStock } = useInventory();
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

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
      setMacAddress(initialData.mac_address || '');
      setVlanId(initialData.vlan_id || '');
      setPppoeUsername(initialData.pppoe_username || '');
    } else {
      setName('');
      setIpAddress('');
      setType(customerId ? DeviceType.CPE : DeviceType.ROUTER);
      setStatus(DeviceStatus.ONLINE);
      setLocation(customerId ? 'Customer Premises' : '');
      setModel('');
      setSerialNumber('');
      setFirmwareVersion('');
      setMacAddress('');
      setVlanId('');
      setPppoeUsername('');
    }
  }, [initialData, customerId]);

  const handleInventorySelect = (itemId: string) => {
      setSelectedInventoryId(itemId);
      const item = inventoryItems.find(i => i.id === itemId);
      if (item) {
          setModel(item.name); // Auto-fill model with item name
          // Map category to device type loosely
          if (item.category === 'Device') {
              if (item.name.toLowerCase().includes('router')) setType(DeviceType.ROUTER);
              if (item.name.toLowerCase().includes('onu') || item.name.toLowerCase().includes('ont')) setType(DeviceType.CPE);
              if (item.name.toLowerCase().includes('switch')) setType(DeviceType.SWITCH);
          }
      }
  };

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
        mac_address: macAddress || undefined,
        vlan_id: vlanId || undefined,
        pppoe_username: pppoeUsername || undefined,
        customer_id: customerId
      });

      // If we used an inventory item and we are creating a NEW device (not editing), deduct stock
      if (selectedInventoryId && !initialData) {
          await adjustStock(selectedInventoryId, -1);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
      if (activeTab === 'general') setActiveTab('specs');
      else if (activeTab === 'specs') setActiveTab('config');
  };

  const handleBack = () => {
      if (activeTab === 'config') setActiveTab('specs');
      else if (activeTab === 'specs') setActiveTab('general');
  };

  const availableDevices = inventoryItems.filter(i => i.category === 'Device' && i.quantity > 0);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex items-center gap-4">
         <Button 
           variant="ghost"
           size="icon"
           onClick={onClose} 
           className="rounded-full bg-white hover:bg-gray-100 shadow-sm border border-gray-200"
         >
             <ArrowLeft className="w-5 h-5 text-gray-600" />
         </Button>
         <div>
             <h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Device Configuration' : 'Register New Device'}</h1>
             <p className="text-sm text-gray-500 mt-1">Manage network hardware, status, and technical parameters</p>
         </div>
      </div>

      <Card className="overflow-hidden border-t-4 border-t-primary-600">
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-gray-50/50 border-b border-gray-100 px-6 pt-6 pb-0">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg mb-6 bg-white border border-gray-200 shadow-sm">
                        <TabsTrigger value="general" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
                            <Info className="w-4 h-4 mr-2" /> General
                        </TabsTrigger>
                        <TabsTrigger value="specs" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
                            <Settings className="w-4 h-4 mr-2" /> Hardware
                        </TabsTrigger>
                        <TabsTrigger value="config" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700">
                            <Sliders className="w-4 h-4 mr-2" /> Config
                        </TabsTrigger>
                    </TabsList>
                </div>

                <CardContent className="p-8 min-h-[400px]">
                    <TabsContent value="general" className="mt-0 space-y-8 animate-in slide-in-from-left-4 duration-300">
                        <Grid cols={1} className="md:grid-cols-2" gap={8}>
                            <div className="md:col-span-2">
                                <Label htmlFor="device-name" className="text-base font-semibold text-gray-900 mb-2 block">Device Identification</Label>
                                <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                       <Server className="h-5 w-5" />
                                   </div>
                                   <Input 
                                     id="device-name" 
                                     required 
                                     className="pl-10 h-11 text-base" 
                                     placeholder={customerId ? "e.g. Living Room Router" : "e.g. Core-Router-JKT-01"} 
                                     value={name} 
                                     onChange={e => setName(e.target.value)} 
                                   />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">A unique descriptive name for identifying this device in the network.</p>
                            </div>

                            <div>
                                <Label htmlFor="ip" className="mb-2 block">IP Address</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <Input id="ip" className="pl-10" placeholder="192.168.1.1" value={ipAddress} onChange={e => setIpAddress(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="location" className="mb-2 block">Physical Location</Label>
                                <Input 
                                  id="location" 
                                  placeholder={customerId ? "e.g. Wall Mounted, Living Room" : "Data Center A, Rack 4, U12"} 
                                  value={location} 
                                  onChange={e => setLocation(e.target.value)} 
                                />
                            </div>

                            <div>
                                <Label htmlFor="type" className="mb-2 block">Device Category</Label>
                                <Select id="type" value={type} onChange={e => setType(e.target.value as DeviceType)}>
                                  <option value={DeviceType.ROUTER}>Router / Gateway</option>
                                  <option value={DeviceType.SWITCH}>Switch</option>
                                  <option value={DeviceType.OLT}>OLT (Optical Line Terminal)</option>
                                  <option value={DeviceType.CPE}>CPE / ONU (Customer Endpoint)</option>
                                  <option value={DeviceType.SERVER}>Server / VM</option>
                                  <option value={DeviceType.OTHER}>Other Infrastructure</option>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status" className="mb-2 block">Operational Status</Label>
                                <Select id="status" value={status} onChange={e => setStatus(e.target.value as DeviceStatus)}>
                                  <option value={DeviceStatus.ONLINE}>Online (Operational)</option>
                                  <option value={DeviceStatus.OFFLINE}>Offline (Down)</option>
                                  <option value={DeviceStatus.WARNING}>Warning (Degraded)</option>
                                  <option value={DeviceStatus.MAINTENANCE}>Maintenance Mode</option>
                                </Select>
                            </div>
                        </Grid>
                    </TabsContent>

                    <TabsContent value="specs" className="mt-0 space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {/* Inventory Linking Section */}
                        {!initialData && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                <Flex align="center" gap={2} className="mb-2 text-blue-800 font-medium text-sm">
                                    <Package className="w-4 h-4" /> Source from Warehouse (Optional)
                                </Flex>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <Select 
                                            value={selectedInventoryId} 
                                            onChange={(e) => handleInventorySelect(e.target.value)}
                                            className="bg-white border-blue-200"
                                        >
                                            <option value="">-- Manual Entry --</option>
                                            {availableDevices.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} ({item.quantity} in stock)
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    {selectedInventoryId && (
                                        <div className="text-xs text-blue-600 pb-2">
                                            <Check className="w-3 h-3 inline mr-1" />
                                            Stock will be deducted (-1)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Grid cols={1} className="md:grid-cols-2" gap={8}>
                            <div className="md:col-span-2 pb-4 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-primary-600" /> Hardware Details
                                </h3>
                            </div>

                            <div>
                                <Label htmlFor="model" className="mb-2 block">Model Number</Label>
                                <Input id="model" placeholder="e.g. MikroTik CCR1009" value={model} onChange={e => setModel(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="serial" className="mb-2 block">Serial Number</Label>
                                <Input id="serial" placeholder="e.g. SN-8842-1923" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="firmware" className="mb-2 block">Firmware / OS Version</Label>
                                <Input id="firmware" placeholder="e.g. RouterOS v7.12" value={firmwareVersion} onChange={e => setFirmwareVersion(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="mac" className="mb-2 block">MAC Address</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Network className="h-4 w-4" />
                                    </div>
                                    <Input id="mac" className="pl-10 font-mono" placeholder="AA:BB:CC:DD:EE:FF" value={macAddress} onChange={e => setMacAddress(e.target.value)} />
                                </div>
                            </div>
                        </Grid>
                    </TabsContent>

                    <TabsContent value="config" className="mt-0 space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <Grid cols={1} className="md:grid-cols-2" gap={8}>
                            <div className="md:col-span-2 pb-4 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-primary-600" /> Network Configuration
                                </h3>
                            </div>

                            <div>
                                <Label htmlFor="vlan" className="mb-2 block">Management VLAN ID</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Hash className="h-4 w-4" />
                                    </div>
                                    <Input id="vlan" className="pl-10" placeholder="e.g. 100" value={vlanId} onChange={e => setVlanId(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="pppoe" className="mb-2 block">PPPoE / Auth Username</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Key className="h-4 w-4" />
                                    </div>
                                    <Input id="pppoe" className="pl-10" placeholder="user@isp-net" value={pppoeUsername} onChange={e => setPppoeUsername(e.target.value)} />
                                </div>
                            </div>
                        </Grid>
                    </TabsContent>
                </CardContent>

                <CardFooter className="flex justify-between items-center gap-3 bg-gray-50 p-6 border-t border-gray-200">
                    <Button type="button" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-900">Cancel</Button>
                    <Flex gap={3}>
                        {activeTab !== 'general' && (
                            <Button type="button" variant="secondary" onClick={handleBack}>
                                Back
                            </Button>
                        )}
                        
                        {activeTab !== 'config' ? (
                            <Button type="button" onClick={handleNext}>
                                Next Step
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="min-w-[140px]">
                                <Save className="w-4 h-4 mr-2" /> 
                                {initialData ? 'Update Device' : 'Register Device'}
                            </Button>
                        )}
                    </Flex>
                </CardFooter>
            </Tabs>
          </form>
      </Card>
    </div>
  );
};
