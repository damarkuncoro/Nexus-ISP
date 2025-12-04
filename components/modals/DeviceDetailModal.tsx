
import React from 'react';
import { NetworkDevice, DeviceType } from '../../types';
import { Server, Wifi, Router, Box, Activity, MapPin, Clock, Cpu, Network, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DeviceStatusBadge } from '../StatusBadges';
import { Flex } from '../ui/flex';
import { Grid, GridItem } from '../ui/grid';
import { Separator } from '../ui/separator';
import { BandwidthMonitor } from '../BandwidthMonitor';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';

const DeviceIcon = ({ type, className = "w-5 h-5" }: { type: DeviceType, className?: string }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={`${className} text-gray-500 dark:text-gray-400`} />;
};

interface DeviceDetailModalProps {
  device: NetworkDevice;
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ device, isOpen, onClose }) => {
  const displayStats = {
      firmware: device.firmware_version || 'N/A',
      serial: device.serial_number || 'N/A',
      model: device.model || 'Standard Device'
  };

  const interfaces = device.interfaces || [];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="sm:max-w-3xl">
        <DialogHeader>
            <Flex align="center" gap={3}>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <DeviceIcon type={device.type} className="w-6 h-6" />
                </div>
                <div>
                    <DialogTitle>{device.name}</DialogTitle>
                    <DialogDescription className="font-mono">{device.ip_address || '0.0.0.0'}</DialogDescription>
                </div>
            </Flex>
        </DialogHeader>

        <div className="py-4 space-y-6">
            <Flex justify="between" className="bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-slate-800/50 dark:border-slate-700">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">Current Status</p>
                    <DeviceStatusBadge status={device.status} />
                </div>
                <div className="text-right">
                     <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">Last Seen</p>
                     <Flex align="center" gap={1} className="text-sm font-medium text-gray-900 dark:text-white">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(device.last_check).toLocaleString()}
                     </Flex>
                </div>
            </Flex>

            {/* Live Traffic */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-slate-800 dark:border-slate-700">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Throughput
                </h4>
                <div className="h-40">
                    <BandwidthMonitor planSpeed="100 Mbps" isLive={device.status === 'online'} />
                </div>
            </div>

            <Grid cols={1} className="md:grid-cols-2" gap={8}>
                <GridItem>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-primary-500" /> Technical Specs</h4>
                    <div className="space-y-3 text-sm">
                        <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Device Type</span><span className="font-medium text-gray-900 dark:text-white capitalize">{device.type}</span></Flex>
                        <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Model</span><span className="font-medium text-gray-900 dark:text-white">{displayStats.model}</span></Flex>
                        <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Serial Number</span><span className="font-medium text-gray-900 dark:text-white font-mono">{displayStats.serial}</span></Flex>
                        <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Firmware</span><span className="font-medium text-gray-900 dark:text-white">{displayStats.firmware}</span></Flex>
                        <Flex justify="between" className="pt-1"><span className="text-gray-500 dark:text-gray-400">Location</span><span className="font-medium text-gray-900 dark:text-white">{device.location || 'N/A'}</span></Flex>
                    </div>
                </GridItem>

                <GridItem>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary-500" /> Performance</h4>
                    <Grid cols={2} gap={4}>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uptime</p><p className="text-sm font-bold text-gray-900 dark:text-white">14d 2h</p></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latency</p><p className="text-sm font-bold text-gray-900 dark:text-white text-green-600 dark:text-green-400">12ms</p></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signal</p><p className="text-sm font-bold text-gray-900 dark:text-white">-45 dBm</p></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Packet Loss</p><p className="text-sm font-bold text-gray-900 dark:text-white">0%</p></div>
                    </Grid>
                </GridItem>
            </Grid>
            
            <Separator />
            
            {/* Interfaces List */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary-500" /> Network Interfaces
                </h4>
                {interfaces.length > 0 ? (
                    <div className="overflow-hidden border border-gray-200 dark:border-slate-700 rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-slate-800/50">
                                    <TableHead>Interface</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>MAC</TableHead>
                                    <TableHead className="text-right">State</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {interfaces.map((intf, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{intf.name}</TableCell>
                                        <TableCell className="capitalize text-xs">{intf.type}</TableCell>
                                        <TableCell className="font-mono text-xs">{intf.ip_address || '-'}</TableCell>
                                        <TableCell className="font-mono text-xs text-gray-500">{intf.mac_address || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={intf.status === 'up' ? 'success' : 'destructive'} className="text-[10px] h-5 px-1.5">
                                                {intf.status?.toUpperCase() || 'UP'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No interfaces configured.</p>
                )}
            </div>
        </div>
    </Dialog>
  );
};