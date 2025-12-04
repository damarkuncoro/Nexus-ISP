import React, { useState, useEffect, useMemo } from 'react';
import { NetworkDevice, DeviceStatus, DeviceType, Subnet } from '../types';
import { Server, Wifi, Router, Box, Activity, Plus, Search, MapPin, Globe, RefreshCw, AlertTriangle, CheckCircle, Trash2, Edit2, Grid as GridIcon, List, Hash, Network, Share2 } from 'lucide-react';
import { DeviceStatusBadge } from './StatusBadges';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useSubnets } from '../hooks/useSubnets';
import { SubnetForm } from './forms/SubnetForm';
import { EmptyState } from './ui/empty-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '../contexts/ToastContext';

interface NetworkViewProps {
  devices: NetworkDevice[];
  onAddDevice: (defaults?: Partial<NetworkDevice>) => void;
  onEditDevice: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string) => void;
  onRefresh: () => void;
}

const DeviceIcon = ({ type, className = "w-6 h-6" }: { type: DeviceType, className?: string }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.SERVER]: Globe,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={className + " text-gray-500 dark:text-gray-400"} />;
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
  const [showSubnetForm, setShowSubnetForm] = useState(false);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [editingSubnet, setEditingSubnet] = useState<Subnet | undefined>(undefined);
  
  const { subnets, loadSubnets, addSubnet, editSubnet, removeSubnet } = useSubnets();
  const { hasPermission } = useAuth();
  const toast = useToast();

  useEffect(() => {
      loadSubnets();
  }, [loadSubnets]);

  // Set default subnet on load
  useEffect(() => {
      if (subnets.length > 0 && !selectedSubnet) {
          setSelectedSubnet(subnets[0]);
      }
  }, [subnets, selectedSubnet]);

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

  // IPAM Grid Calculation
  const ipamData = useMemo(() => {
      if (!selectedSubnet) return { grid: [], utilization: 0, usedCount: 0, freeCount: 0 };

      // Basic support for /24 visualization
      const cidrParts = selectedSubnet.cidr.split('/');
      const ipParts = cidrParts[0].split('.');
      const prefix = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;
      
      // Collect all IPs from devices and their interfaces
      const usedIpsMap = new Map<string, { deviceName: string, type: string, device: NetworkDevice }>();
      
      devices.forEach(d => {
          if (d.ip_address) usedIpsMap.set(d.ip_address, { deviceName: d.name, type: 'Device IP', device: d });
          d.interfaces?.forEach(intf => {
              if (intf.ip_address) usedIpsMap.set(intf.ip_address, { deviceName: `${d.name} (${intf.name})`, type: 'Interface IP', device: d });
          });
      });

      const grid = Array.from({ length: 256 }, (_, i) => {
          const ip = `${prefix}${i}`;
          const usage = usedIpsMap.get(ip);
          
          let status = 'free';
          if (i === 0) status = 'network';
          if (i === 255) status = 'broadcast';
          if (ip === selectedSubnet.gateway) status = 'gateway';
          if (usage) status = 'used';
          
          return { id: i, ip, status, usage };
      });

      const usedCount = grid.filter(g => g.status === 'used').length;
      const utilization = Math.round((usedCount / 254) * 100);

      return { grid, utilization, usedCount, freeCount: 254 - usedCount };
  }, [devices, selectedSubnet]);

  // Topology Data Calculation
  const topologyData = useMemo(() => {
      return subnets.map(subnet => {
          const cidrParts = subnet.cidr.split('/');
          // Simplified matching: check if IP starts with first 3 octets
          // In a real app, use a proper CIDR library
          const prefix = subnet.cidr.split('.').slice(0, 3).join('.');
          
          const connectedDevices = devices.filter(d => {
              const deviceIpMatch = d.ip_address.startsWith(prefix);
              const interfaceMatch = d.interfaces?.some(intf => intf.ip_address?.startsWith(prefix));
              return deviceIpMatch || interfaceMatch;
          });

          return {
              subnet,
              devices: connectedDevices,
              gatewayDevice: connectedDevices.find(d => d.ip_address === subnet.gateway || d.interfaces?.some(i => i.ip_address === subnet.gateway))
          };
      });
  }, [subnets, devices]);

  const handleSaveSubnet = async (data: any) => {
      try {
          if (editingSubnet) {
              await editSubnet(editingSubnet.id, data);
              toast.success("Subnet updated successfully");
          } else {
              await addSubnet(data);
              toast.success("Subnet created successfully");
          }
          setShowSubnetForm(false);
          setEditingSubnet(undefined);
      } catch (e: any) {
          toast.error(e.message);
      }
  };

  const handleEditSubnetClick = (subnet: Subnet) => {
      setEditingSubnet(subnet);
      setShowSubnetForm(true);
  };

  const handleAddSubnetClick = () => {
      setEditingSubnet(undefined);
      setShowSubnetForm(true);
  };

  const handleDeleteSubnet = async (id: string) => {
      try {
          await removeSubnet(id);
          toast.success("Subnet deleted");
          if (selectedSubnet?.id === id) setSelectedSubnet(null);
      } catch (e: any) {
          toast.error(e.message);
      }
  };

  const handleIpClick = (cell: any) => {
      if (cell.usage) {
          // Edit existing device
          onEditDevice(cell.usage.device);
      } else if (cell.status === 'free') {
          // Provision new device on this IP
          if (hasPermission('manage_network')) {
              onAddDevice({ 
                  ip_address: cell.ip,
                  location: selectedSubnet?.location
              });
          }
      }
  };

  if (showSubnetForm) {
      return <SubnetForm onClose={() => setShowSubnetForm(false)} onSubmit={handleSaveSubnet} initialData={editingSubnet} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <Grid cols={1} className="md:grid-cols-4" gap={4}>
         <Flex align="center" justify="between" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Devices</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg"><Server className="w-5 h-5 text-gray-500 dark:text-gray-300" /></div>
         </Flex>
         <Flex align="center" justify="between" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Online</p>
               <p className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.online}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg"><CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" /></div>
         </Flex>
         <Flex align="center" justify="between" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Offline</p>
               <p className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.offline}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" /></div>
         </Flex>
         <Flex align="center" justify="between" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <div>
               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Warning</p>
               <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{stats.warning}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" /></div>
         </Flex>
      </Grid>
      
      <Card>
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <Flex justify="between" align="center" className="p-4 border-b border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700 flex-col sm:flex-row gap-4">
                <TabsList>
                    <TabsTrigger value="list"><List className="w-4 h-4 mr-2" /> Device List</TabsTrigger>
                    <TabsTrigger value="ipam"><GridIcon className="w-4 h-4 mr-2" /> IP Address Map</TabsTrigger>
                    <TabsTrigger value="topology"><Share2 className="w-4 h-4 mr-2" /> Topology</TabsTrigger>
                </TabsList>

                {activeTab === 'list' && (
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <Input type="text" className="pl-10 h-9" placeholder="Search devices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                )}

                <Flex gap={2}>
                    <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="w-3 h-3 mr-2" /> Refresh</Button>
                    {hasPermission('manage_network') && <Button size="sm" onClick={() => onAddDevice()}><Plus className="w-3 h-3 mr-2" /> Add Device</Button>}
                </Flex>
            </Flex>

            <CardContent className="p-0">
                <TabsContent value="list" className="m-0">
                    {filteredDevices.length > 0 ? (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                        {filteredDevices.map(device => (
                            <li key={device.id}>
                                <Flex align="center" justify="between" className="px-6 py-4 group">
                                <Flex align="center" gap={4} className="flex-1 min-w-0">
                                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg"><DeviceIcon type={device.type} /></div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{device.name}</h4>
                                        <Flex align="center" gap={2} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="font-mono bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{device.ip_address}</span>
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30">
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
                                action={devices.length === 0 && hasPermission('manage_network') ? { label: "Add Device", onClick: () => onAddDevice() } : undefined}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="ipam" className="m-0 p-6">
                    <Grid cols={1} className="lg:grid-cols-4" gap={8}>
                        {/* Sidebar: Subnet Selection */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Subnets</h3>
                                {hasPermission('manage_network') && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAddSubnetClick} title="Add Subnet">
                                        <Plus className="w-3 h-3 mr-1" /> Add Subnet
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {subnets.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">No subnets defined.</p>
                                        {hasPermission('manage_network') && (
                                            <Button size="sm" variant="ghost" className="text-xs text-primary-600 dark:text-primary-400" onClick={handleAddSubnetClick}>Create Subnet</Button>
                                        )}
                                    </div>
                                )}
                                {subnets.map(subnet => (
                                    <div 
                                        key={subnet.id}
                                        onClick={() => setSelectedSubnet(subnet)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors group relative ${selectedSubnet?.id === subnet.id ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`text-sm font-medium ${selectedSubnet?.id === subnet.id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{subnet.name}</p>
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">{subnet.cidr}</p>
                                            </div>
                                            {subnet.vlan_id && <span className="text-[10px] bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">VLAN {subnet.vlan_id}</span>}
                                        </div>
                                        {hasPermission('manage_network') && (
                                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 dark:bg-slate-800/80 rounded p-0.5 backdrop-blur-sm shadow-sm">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" onClick={(e) => { e.stopPropagation(); handleEditSubnetClick(subnet); }}>
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Delete Subnet?</AlertDialogTitle><AlertDialogDescription>This will remove the subnet definition but not the devices.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel><AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteSubnet(subnet.id); }}>Delete</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Grid */}
                        <div className="lg:col-span-3">
                            {selectedSubnet ? (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Globe className="w-4 h-4" /> {selectedSubnet.name} ({selectedSubnet.cidr})</h4>
                                            <p className="text-xs text-gray-500 mt-1">{selectedSubnet.description || 'No description'}</p>
                                        </div>
                                        <div className="flex gap-4 text-xs">
                                            <div>
                                                <span className="block text-gray-500 mb-1">Utilization</span>
                                                <span className="font-bold text-lg dark:text-white">{ipamData.utilization}%</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 mb-1">Used IPs</span>
                                                <span className="font-bold text-lg dark:text-white">{ipamData.usedCount}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 mb-1">Free IPs</span>
                                                <span className="font-bold text-lg text-green-600 dark:text-green-500">{ipamData.freeCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-xs mb-2">
                                        <Flex align="center" gap={2}><div className="w-3 h-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded"></div><span className="text-gray-600 dark:text-gray-400">Available (Click to Add)</span></Flex>
                                        <Flex align="center" gap={2}><div className="w-3 h-3 bg-blue-500 rounded"></div><span className="text-gray-600 dark:text-gray-400">Gateway</span></Flex>
                                        <Flex align="center" gap={2}><div className="w-3 h-3 bg-red-500 rounded"></div><span className="text-gray-600 dark:text-gray-400">Device</span></Flex>
                                        <Flex align="center" gap={2}><div className="w-3 h-3 bg-amber-400 rounded"></div><span className="text-gray-600 dark:text-gray-400">Reserved</span></Flex>
                                    </div>

                                    <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                                        {ipamData.grid.map((cell) => {
                                            let bgClass = "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-400 dark:text-slate-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700";
                                            if (cell.status === 'network' || cell.status === 'broadcast') bgClass = "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-500 cursor-not-allowed";
                                            if (cell.status === 'gateway') bgClass = "bg-blue-500 border-blue-600 text-white dark:border-blue-400 cursor-not-allowed";
                                            if (cell.status === 'used') bgClass = "bg-red-500 border-red-600 text-white cursor-pointer hover:bg-red-600 dark:border-red-400";

                                            return (
                                                <div 
                                                    key={cell.id} 
                                                    className={`aspect-square border rounded flex items-center justify-center text-[10px] relative group transition-all ${bgClass}`}
                                                    onClick={() => handleIpClick(cell)}
                                                >
                                                    {cell.id}
                                                    {/* Hover Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48 bg-gray-900 text-white text-xs rounded p-2 shadow-lg pointer-events-none">
                                                        {cell.usage ? (
                                                            <>
                                                                <p className="font-bold truncate">{cell.usage.deviceName}</p>
                                                                <p className="text-gray-300 font-mono">{cell.ip}</p>
                                                                <p className="text-[10px] text-gray-400">{cell.usage.type}</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="font-bold text-green-400">Available</p>
                                                                <p className="text-gray-300 font-mono">{cell.ip}</p>
                                                                <p className="text-[10px] text-gray-400">Click to provision</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
                                    <div className="text-center p-8">
                                        <Network className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                        <h3 className="text-gray-900 dark:text-white font-medium">Select a Subnet</h3>
                                        <p className="text-gray-500 text-sm mt-1">Choose a subnet from the sidebar to view IP utilization.</p>
                                        {subnets.length === 0 && hasPermission('manage_network') && (
                                             <Button size="sm" variant="outline" className="mt-4" onClick={handleAddSubnetClick}>Create First Subnet</Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Grid>
                </TabsContent>

                {/* --- TOPOLOGY TAB --- */}
                <TabsContent value="topology" className="m-0 p-6 bg-gray-50 dark:bg-slate-900 min-h-[600px]">
                    {subnets.length === 0 ? (
                        <EmptyState icon={Share2} title="No Topology Data" message="Add subnets and devices to see the network graph." />
                    ) : (
                        <div className="space-y-12">
                            {topologyData.map((topo, idx) => (
                                <div key={topo.subnet.id} className="relative">
                                    {/* Connection Lines (SVG Overlay) */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                                        {/* Lines will be drawn conceptually by CSS borders for simplicity in this grid layout */}
                                        {/* Drawing lines from Center Subnet to Devices below */}
                                    </svg>

                                    <div className="flex flex-col items-center z-10 relative">
                                        {/* Level 1: Subnet Cloud */}
                                        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-full flex flex-col items-center justify-center w-48 h-32 shadow-sm text-center">
                                            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-1" />
                                            <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm">{topo.subnet.name}</h3>
                                            <span className="text-xs font-mono text-blue-700 dark:text-blue-300">{topo.subnet.cidr}</span>
                                            {topo.subnet.vlan_id && <span className="text-[10px] bg-white dark:bg-slate-800 px-1.5 rounded border border-blue-100 dark:border-blue-900 mt-1">VLAN {topo.subnet.vlan_id}</span>}
                                        </div>

                                        {/* Level 2: Devices */}
                                        {topo.devices.length > 0 ? (
                                            <div className="flex flex-wrap justify-center gap-6 relative">
                                                {/* Vertical Connector Line from Subnet */}
                                                <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gray-300 dark:bg-slate-600 -translate-x-1/2"></div>
                                                
                                                {/* Horizontal Connector Bar if multiple devices */}
                                                {topo.devices.length > 1 && (
                                                    <div className="absolute -top-4 left-4 right-4 h-0.5 bg-gray-300 dark:bg-slate-600"></div>
                                                )}

                                                {topo.devices.map(device => {
                                                    const isGateway = topo.gatewayDevice?.id === device.id;
                                                    return (
                                                        <div key={device.id} className="flex flex-col items-center relative pt-4 group">
                                                            {/* Vertical Connector to Device */}
                                                            <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-gray-300 dark:bg-slate-600 -translate-x-1/2"></div>
                                                            
                                                            <div 
                                                                onClick={() => onEditDevice(device)}
                                                                className={`w-40 p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center ${isGateway ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-slate-700'}`}
                                                            >
                                                                <div className={`p-2 rounded-full mb-2 ${isGateway ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                                                    <DeviceIcon type={device.type} className={`w-5 h-5 ${isGateway ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                                                </div>
                                                                <p className="font-bold text-xs text-gray-900 dark:text-white truncate w-full">{device.name}</p>
                                                                <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{device.ip_address}</p>
                                                                {isGateway && <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 mt-1">Gateway</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic mt-4">No connected devices detected.</div>
                                        )}
                                    </div>
                                    
                                    {/* Separator between subnets */}
                                    {idx < topologyData.length - 1 && <div className="border-b border-gray-200 dark:border-slate-700 w-full my-12"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </CardContent>
          </Tabs>
      </Card>
    </div>
  );
};
