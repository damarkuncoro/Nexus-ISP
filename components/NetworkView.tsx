
import React, { useState, useMemo } from 'react';
import { NetworkDevice, DeviceStatus, DeviceType } from '../types';
import { Server, Wifi, Router, Box, Activity, Plus, Search, MapPin, Globe, RefreshCw, AlertTriangle, CheckCircle, Trash2, Edit2, Grid as GridIcon, List } from 'lucide-react';
import { DeviceStatusBadge } from './StatusBadges';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
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
  const [activeTab, setActiveTab] = useState('list');
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

  // IPAM Logic
  const ipamData = useMemo(() => {
      // Mock Subnet 192.168.1.x for visualization
      const subnetPrefix = "192.168.1.";
      const grid = Array.from({ length: 256 }, (_, i) => {
          const ip = `${subnetPrefix}${i}`;
          const device = devices.find(d => d.ip_address === ip);
          let status = 'free';
          if (i === 0 || i === 255) status = 'reserved';
          if (i === 1) status = 'gateway';
          if (device) status = 'used';
          
          return { id: i, ip, status, device };
      });

      const usedCount = grid.filter(g => g.status === 'used').length;
      const utilization = Math.round((usedCount / 254) * 100); // Exclude 0 and 255

      return { grid, utilization, usedCount, freeCount: 254 - usedCount };
  }, [devices]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
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
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <Flex justify="between" align="center" className="p-4 border-b border-gray-200 bg-gray-50 flex-col sm:flex-row gap-4">
                <TabsList>
                    <TabsTrigger value="list"><List className="w-4 h-4 mr-2" /> Device List</TabsTrigger>
                    <TabsTrigger value="ipam"><GridIcon className="w-4 h-4 mr-2" /> IP Address Map</TabsTrigger>
                </TabsList>

                {activeTab === 'list' && (
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <Input type="text" className="pl-10 h-9" placeholder="Search devices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                )}

                <Flex gap={2}>
                    <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="w-3 h-3 mr-2" /> Refresh</Button>
                    {hasPermission('manage_network') && <Button size="sm" onClick={onAddDevice}><Plus className="w-3 h-3 mr-2" /> Add Device</Button>}
                </Flex>
            </Flex>

            <CardContent className="p-0">
                <TabsContent value="list" className="m-0">
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
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{device.ip_address}</span>
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
                </TabsContent>

                <TabsContent value="ipam" className="m-0 p-6">
                    <Grid cols={1} className="lg:grid-cols-4" gap={8}>
                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Subnet 192.168.1.0/24</h4>
                                <div className="space-y-3">
                                    <div>
                                        <Flex justify="between" className="text-xs mb-1">
                                            <span className="text-gray-500">Utilization</span>
                                            <span className="font-medium text-gray-900">{ipamData.utilization}%</span>
                                        </Flex>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${ipamData.utilization}%` }}></div>
                                        </div>
                                    </div>
                                    <Grid cols={2} gap={4} className="pt-2">
                                        <div className="text-center p-2 bg-white rounded border border-gray-100">
                                            <p className="text-xs text-gray-500">Used</p>
                                            <p className="text-lg font-bold text-gray-900">{ipamData.usedCount}</p>
                                        </div>
                                        <div className="text-center p-2 bg-white rounded border border-gray-100">
                                            <p className="text-xs text-gray-500">Free</p>
                                            <p className="text-lg font-bold text-green-600">{ipamData.freeCount}</p>
                                        </div>
                                    </Grid>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legend</p>
                                <Flex align="center" gap={2}><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div><span className="text-xs text-gray-600">Available</span></Flex>
                                <Flex align="center" gap={2}><div className="w-3 h-3 bg-blue-500 rounded"></div><span className="text-xs text-gray-600">Gateway / Core</span></Flex>
                                <Flex align="center" gap={2}><div className="w-3 h-3 bg-red-500 rounded"></div><span className="text-xs text-gray-600">Assigned Device</span></Flex>
                                <Flex align="center" gap={2}><div className="w-3 h-3 bg-amber-400 rounded"></div><span className="text-xs text-gray-600">Reserved / Broadcast</span></Flex>
                            </div>
                        </div>

                        {/* Visual Grid */}
                        <div className="lg:col-span-3">
                            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                                {ipamData.grid.map((cell) => {
                                    let bgClass = "bg-gray-50 border-gray-200 hover:bg-gray-100";
                                    if (cell.status === 'reserved') bgClass = "bg-amber-100 border-amber-300";
                                    if (cell.status === 'gateway') bgClass = "bg-blue-500 border-blue-600 text-white";
                                    if (cell.status === 'used') bgClass = "bg-red-500 border-red-600 text-white cursor-pointer hover:bg-red-600";

                                    return (
                                        <div 
                                            key={cell.id} 
                                            className={`aspect-square border rounded flex items-center justify-center text-[10px] relative group transition-colors ${bgClass}`}
                                            title={cell.device ? `${cell.device.name} (${cell.device.type})` : cell.ip}
                                            onClick={() => cell.device && onEditDevice(cell.device)}
                                        >
                                            {cell.id}
                                            {/* Tooltip on Hover */}
                                            {cell.status === 'used' && cell.device && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
                                                    <p className="font-bold truncate">{cell.device.name}</p>
                                                    <p className="text-gray-300">{cell.ip}</p>
                                                    <p className="text-[10px] text-gray-400 capitalize">{cell.device.type}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Grid>
                </TabsContent>
            </CardContent>
          </Tabs>
      </Card>
    </div>
  );
};
