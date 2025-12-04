
import React, { useState } from 'react';
import { NetworkDevice, DeviceType } from '../../../types';
import { Server, Wifi, Router, Box, Activity, Plus, MapPin } from 'lucide-react';
import { DeviceStatusBadge } from '../../../components/StatusBadges';
import { Grid } from '../../../components/ui/grid';
import { Flex } from '../../../components/ui/flex';
import { DeviceDetailModal } from './DeviceDetailModal';
import { EmptyState } from '../../../components/ui/empty-state';

interface CustomerDevicesProps {
  devices: NetworkDevice[];
  onAddDevice: () => void;
  onEditDevice: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string) => void;
}

const DeviceIcon = ({ type, className = "w-5 h-5" }: { type: DeviceType, className?: string }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.SERVER]: Wifi, 
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={`${className} text-gray-500`} />;
};

export const CustomerDevices: React.FC<CustomerDevicesProps> = ({ devices, onAddDevice, onEditDevice, onDeleteDevice }) => {
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Flex justify="between" align="center" className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Flex align="center" gap={3}>
              <h3 className="text-lg font-medium text-gray-900">Assigned Equipment</h3>
              <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">{devices.length}</span>
          </Flex>
          <button onClick={onAddDevice} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm"><Plus className="w-3 h-3 mr-1" /> Add Device</button>
        </Flex>

        <div className="p-6">
          {devices.length === 0 ? (
             <EmptyState 
                icon={Router}
                title="No devices assigned"
                message="Assign equipment like routers or CPEs to this customer."
                action={{
                    label: 'Assign First Device',
                    onClick: onAddDevice
                }}
             />
          ) : (
             <Grid cols={1} className="md:grid-cols-2" gap={4}>
                {devices.map(device => (
                   <div key={device.id} onClick={() => setSelectedDevice(device)} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group bg-white hover:border-primary-200">
                      <Flex justify="between" align="start" className="mb-3">
                         <Flex align="center" gap={3}>
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary-50 transition-colors"><DeviceIcon type={device.type} className="w-5 h-5 group-hover:text-primary-600" /></div>
                            <div>
                               <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-700">{device.name}</h4>
                               <p className="text-xs text-gray-500 font-mono">{device.ip_address || 'No IP'}</p>
                            </div>
                         </Flex>
                         <DeviceStatusBadge status={device.status} />
                      </Flex>
                      <div className="space-y-2 text-xs text-gray-600 mt-2 pl-1">
                         <Flex align="center" gap={2}><MapPin className="w-3 h-3 text-gray-400" /><span>{device.location || 'Location not specified'}</span></Flex>
                         <Flex align="center" gap={2}><Activity className="w-3 h-3 text-gray-400" /><span>Last Check: {new Date(device.last_check).toLocaleDateString()}</span></Flex>
                      </div>
                   </div>
                ))}
             </Grid>
          )}
        </div>
      </div>

      {selectedDevice && (
          <DeviceDetailModal 
            device={selectedDevice} 
            isOpen={!!selectedDevice}
            onClose={() => setSelectedDevice(null)} 
          />
      )}
    </>
  );
};
