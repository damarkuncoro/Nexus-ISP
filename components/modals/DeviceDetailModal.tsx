import React from 'react';
import { NetworkDevice, DeviceType } from '../../types';
import { Server, Wifi, Router, Box, Activity, MapPin, Clock, Cpu } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DeviceStatusBadge } from '../StatusBadges';
import { Flex } from '../ui/flex';
import { Grid, GridItem } from '../ui/grid';
import { Separator } from '../ui/separator';

const DeviceIcon = ({ type, className = "w-5 h-5" }: { type: DeviceType, className?: string }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={`${className} text-gray-500`} />;
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

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="sm:max-w-2xl">
        <DialogHeader>
            <Flex align="center" gap={3}>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                    <DeviceIcon type={device.type} className="w-6 h-6" />
                </div>
                <div>
                    <DialogTitle>{device.name}</DialogTitle>
                    <DialogDescription className="font-mono">{device.ip_address || '0.0.0.0'}</DialogDescription>
                </div>
            </Flex>
        </DialogHeader>

        <div className="py-4 space-y-6">
            <Flex justify="between" className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Current Status</p>
                    <DeviceStatusBadge status={device.status} />
                </div>
                <div className="text-right">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Last Seen</p>
                     <Flex align="center" gap={1} className="text-sm font-medium text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(device.last_check).toLocaleString()}
                     </Flex>
                </div>
            </Flex>

            <Grid cols={1} className="md:grid-cols-2" gap={8}>
                <GridItem>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-primary-500" /> Technical Specs</h4>
                    <div className="space-y-3 text-sm">
                        <Flex justify="between" className="border-b border-gray-100 pb-2"><span className="text-gray-500">Device Type</span><span className="font-medium text-gray-900 capitalize">{device.type}</span></Flex>
                        <Flex justify="between" className="border-b border-gray-100 pb-2"><span className="text-gray-500">Model</span><span className="font-medium text-gray-900">{displayStats.model}</span></Flex>
                        <Flex justify="between" className="border-b border-gray-100 pb-2"><span className="text-gray-500">Serial Number</span><span className="font-medium text-gray-900 font-mono">{displayStats.serial}</span></Flex>
                        <Flex justify="between" className="border-b border-gray-100 pb-2"><span className="text-gray-500">Firmware</span><span className="font-medium text-gray-900">{displayStats.firmware}</span></Flex>
                        <Flex justify="between" className="pt-1"><span className="text-gray-500">Location</span><span className="font-medium text-gray-900">{device.location || 'N/A'}</span></Flex>
                    </div>
                </GridItem>

                <GridItem>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary-500" /> Performance</h4>
                    <Grid cols={2} gap={4}>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Uptime</p><p className="text-sm font-bold text-gray-900">14d 2h</p></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Latency</p><p className="text-sm font-bold text-gray-900 text-green-600">12ms</p></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Signal</p><p className="text-sm font-bold text-gray-900">-45 dBm</p></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center"><p className="text-xs text-gray-500 mb-1">Packet Loss</p><p className="text-sm font-bold text-gray-900">0%</p></div>
                    </Grid>
                </GridItem>
            </Grid>
            <Separator />
             <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Recent Events</h4>
                <p className="text-xs text-gray-500">Mock event log data.</p>
             </div>
        </div>
    </Dialog>
  );
};