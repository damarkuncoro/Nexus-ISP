import React, { useState } from 'react';
import { NetworkDevice, DeviceStatus, DeviceType } from '../types';
import { Server, Wifi, Router, Box, Activity, Plus, Search, MapPin, Globe, RefreshCw, AlertTriangle, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { DeviceStatusBadge } from './StatusBadges';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from './ui/empty-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface NetworkViewProps {
  devices: NetworkDevice[];
  onAddDevice: () => void;
  onEditDevice: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string) => void;
  onRefresh: () => void;
}

const DeviceIcon = ({ type }: { type: DeviceType }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.SERVER]: Globe,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className="w-6 h-6 text-gray-500" />;
};

export const NetworkView: React.FC<NetworkViewProps> = ({ 
  devices, 
  onAddDevice, 
  onEditDevice, 
  onDeleteDevice,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.ip_address && d.ip_address.includes(searchTerm)) ||
    (d.location && d.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === DeviceStatus.ONLINE).length,
    offline: devices.filter(d => d.status === DeviceStatus.OFFLINE).length,
    warning: devices.filter(d => d.status === DeviceStatus.WARNING).length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* FIX: Completed the stats grid which was truncated and had a typo. */}
      <Grid cols={1} className="md:grid-cols-4" gap={4}>
         <Flex align="center" justify="between" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 uppercase font-medium">Total Devices</p>
               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg"><Server className="w-5 h-5 text-gray-500" /></div>
         </Flex>
         <Flex align="center" justify="between" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 uppercase font-medium">Online</p>
               <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-500" /></div>
         </Flex>
         <Flex align="center" justify="between" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 uppercase font-medium">Offline</p>
               <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
         </Flex>
         <Flex align="center" justify="between" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 uppercase font-medium">Warning</p>
               <p className="text-2xl font-bold text-amber-600">{stats.warning}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
         </Flex>
      </Grid>
      
      <Card>
          <Flex justify="between" align="center" className="p-4 border-b border-gray-200 bg-gray-50">
             <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                <Input type="text" className="pl-10" placeholder="Search by name, IP, location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="w-3 h-3 mr-2" /> Refresh</Button>
          </Flex>

          <CardContent className="p-0">
             {filteredDevices.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredDevices.map(device => (
                     <li key={device.id}>
                        <Flex align="center" justify="between" className="px-6 py-4 group">
                           <Flex align="center" gap={4} className="flex-1 min-w-0">
                              <div className="p-2 bg-gray-100 rounded-lg"><DeviceIcon type={device.type} /></div>
                              <div className="min-w-0">
                                 <h4 className="text-sm font-bold text-gray-900 truncate">{device.name}</h4>
                                 <Flex align="center" gap={2} className="text-xs text-gray-500 mt-1">
                                    <span className="font-mono">{device.ip_address}</span>
                                    {device.location && <><span className="text-gray-300">•</span><Flex align="center" gap={1}><MapPin className="w-3 h-3" />{device.location}</Flex></>}
                                 </Flex>
                              </div>
                           </Flex>
                           <Flex align="center" gap={4}>
                              <DeviceStatusBadge status={device.status} />
                              {hasPermission('manage_network') && (
                                <Flex gap={1} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditDevice(device)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Device?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to remove {device.name}? This cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDeleteDevice(device.id)}>Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </Flex>
                              )}
                           </Flex>
                        </Flex>
                     </li>
                  ))}
                </ul>
             ) : (
                <div className="p-6">
                    <EmptyState 
                        icon={Server}
                        title="No network devices found"
                        message={devices.length === 0 ? "Add your first network device to get started." : "No devices found matching your search."}
                        action={devices.length === 0 && hasPermission('manage_network') ? { label: "Add Device", onClick: onAddDevice } : undefined}
                    />
                </div>
             )}
          </CardContent>
      </Card>
    </div>
  );
};
