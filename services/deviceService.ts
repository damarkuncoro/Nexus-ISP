
import { supabase } from './supabaseClient';
import { NetworkDevice, NetworkInterface } from '../types';

export const fetchDevices = async (): Promise<NetworkDevice[]> => {
  const { data, error } = await supabase
    .from('network_devices')
    .select('*, interfaces:network_interfaces(*)') // Join interfaces
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    // Fallback if join fails (schema mismatch)
    if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
        const { data: simpleData } = await supabase.from('network_devices').select('*').order('name', { ascending: true });
        return simpleData as NetworkDevice[];
    }
    throw error;
  }
  return data as NetworkDevice[];
};

export const createDevice = async (
    device: Omit<NetworkDevice, 'id' | 'created_at' | 'last_check' | 'interfaces'> & { interfaces?: Omit<NetworkInterface, 'id' | 'device_id' | 'created_at'>[] }
): Promise<NetworkDevice> => {
  // 1. Create Device
  const { interfaces, ...deviceData } = device;
  
  const { data: newDevice, error } = await supabase
    .from('network_devices')
    .insert([{
        ...deviceData,
        last_check: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;

  // 2. Create Interfaces if any
  if (interfaces && interfaces.length > 0 && newDevice) {
      const interfacesPayload = interfaces.map(intf => ({
          ...intf,
          device_id: newDevice.id
      }));
      const { error: intError } = await supabase.from('network_interfaces').insert(interfacesPayload);
      if (intError) console.error("Error saving interfaces", intError);
  }

  // Return full object
  return { ...newDevice, interfaces: interfaces || [] } as NetworkDevice;
};

export const updateDevice = async (
    id: string, 
    updates: Partial<NetworkDevice> & { interfaces?: Partial<NetworkInterface>[] }
): Promise<NetworkDevice> => {
  const { interfaces, ...deviceUpdates } = updates;

  // 1. Update Device
  const { data: updatedDevice, error } = await supabase
    .from('network_devices')
    .update({
        ...deviceUpdates,
        last_check: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // 2. Handle Interfaces (Sync Strategy: Delete all for device and re-insert)
  // Note: specific ID updates would be more efficient in production but this ensures sync without complex diffing
  if (interfaces) {
      await supabase.from('network_interfaces').delete().eq('device_id', id);
      
      if (interfaces.length > 0) {
          const interfacesPayload = interfaces.map(intf => ({
              device_id: id,
              name: intf.name || 'eth',
              ip_address: intf.ip_address,
              mac_address: intf.mac_address,
              status: intf.status || 'up',
              type: intf.type || 'ethernet'
          }));
          await supabase.from('network_interfaces').insert(interfacesPayload);
      }
  }

  return { ...updatedDevice, interfaces: interfaces || [] } as NetworkDevice;
};

export const deleteDevice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('network_devices')
    .delete()
    .eq('id', id);

  if (error) throw error;
};