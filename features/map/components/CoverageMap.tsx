
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as L from 'leaflet';
import { Customer, CustomerStatus } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Map as MapIcon, Navigation } from 'lucide-react';
import { Flex } from '../../../components/ui/flex';
import { useTheme } from '../../../hooks/useTheme';

interface CoverageMapProps {
  customers: Customer[];
  onCustomerSelect: (customerId: string) => void;
}

export const CoverageMap: React.FC<CoverageMapProps> = ({ customers, onCustomerSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { theme } = useTheme();

  // Filter customers with valid coordinates
  const validCustomers = useMemo(() => {
    return customers.filter(c => {
      if (!c.coordinates) return false;
      const [lat, lng] = c.coordinates.split(',').map(s => parseFloat(s.trim()));
      return !isNaN(lat) && !isNaN(lng) && (filterStatus === 'all' || c.account_status === filterStatus);
    });
  }, [customers, filterStatus]);

  // Status Stats
  const stats = useMemo(() => ({
      total: validCustomers.length,
      active: validCustomers.filter(c => c.account_status === CustomerStatus.ACTIVE).length,
      pending: validCustomers.filter(c => c.account_status === CustomerStatus.PENDING || c.account_status === CustomerStatus.LEAD).length,
      issue: validCustomers.filter(c => c.account_status === CustomerStatus.SUSPENDED || c.account_status === CustomerStatus.CANCELLED).length
  }), [validCustomers]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    // Initialize Map centered on Jakarta (or general region)
    const map = L.map(mapRef.current).setView([-6.2088, 106.8456], 11);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Handle Theme Changes (Switch Tiles)
  useEffect(() => {
      if (!mapInstance.current) return;

      // Remove old layer
      if (tileLayerRef.current) {
          mapInstance.current.removeLayer(tileLayerRef.current);
      }

      const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      
      const attribution = theme === 'dark' 
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; OpenStreetMap contributors';

      const newLayer = L.tileLayer(theme === 'dark' ? darkTiles : lightTiles, {
          attribution,
          maxZoom: 19,
      });

      newLayer.addTo(mapInstance.current);
      tileLayerRef.current = newLayer;

  }, [theme]);

  // Update Markers
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    validCustomers.forEach(customer => {
      const [lat, lng] = customer.coordinates!.split(',').map(s => parseFloat(s.trim()));
      
      let colorClass = 'bg-gray-500';
      let ringClass = 'border-gray-200';
      
      switch (customer.account_status) {
          case CustomerStatus.ACTIVE: 
              colorClass = 'bg-green-500'; 
              ringClass = 'border-green-200';
              break;
          case CustomerStatus.PENDING: 
          case CustomerStatus.LEAD:
              colorClass = 'bg-amber-500'; 
              ringClass = 'border-amber-200';
              break;
          case CustomerStatus.SUSPENDED: 
          case CustomerStatus.CANCELLED:
              colorClass = 'bg-red-500'; 
              ringClass = 'border-red-200';
              break;
      }

      // Custom DivIcon for performant CSS styling
      const customIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${colorClass} ring-2 ${ringClass}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 min-w-[200px] text-gray-900'; // Force text color for popup
      popupContent.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <div class="font-bold">${customer.name}</div>
        </div>
        <div class="text-xs text-gray-500 mb-2">${customer.address || 'No address'}</div>
        <div class="mb-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                customer.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }">${customer.account_status}</span>
            ${customer.subscription_plan ? `<span class="ml-1 px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700">${customer.subscription_plan}</span>` : ''}
        </div>
        <button id="btn-${customer.id}" class="w-full bg-primary-600 text-white text-xs py-1.5 rounded hover:bg-primary-700 transition-colors">
            View Details
        </button>
      `;

      marker.bindPopup(popupContent);
      
      // Handle Popup Click
      marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${customer.id}`);
          if (btn) {
              btn.onclick = () => onCustomerSelect(customer.id);
          }
      });

      markersLayer.current.addLayer(marker);
    });

    // Auto-fit bounds if we have points
    if (validCustomers.length > 0) {
        const bounds = L.latLngBounds(validCustomers.map(c => {
            const [lat, lng] = c.coordinates!.split(',').map(s => parseFloat(s.trim()));
            return [lat, lng];
        }));
        mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [validCustomers, onCustomerSelect]);

  const setCenter = () => {
      if(mapInstance.current && validCustomers.length > 0) {
        const [lat, lng] = validCustomers[0].coordinates!.split(',').map(s => parseFloat(s.trim()));
        mapInstance.current.setView([lat, lng], 13);
      }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
        <Card className="p-1 dark:bg-slate-800 dark:border-slate-700">
            <Flex justify="between" align="center" className="p-3 bg-white dark:bg-slate-800 rounded-lg flex-col sm:flex-row gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-primary-600" /> Service Coverage Map
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Geographic distribution of subscribers.</p>
                </div>

                <Flex gap={4} align="center" className="w-full sm:w-auto">
                    <div className="flex items-center gap-3 text-xs font-medium dark:text-gray-300">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Active ({stats.active})</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pending ({stats.pending})</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Issue ({stats.issue})</span>
                    </div>
                    <div className="w-40">
                        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">Show All Status</option>
                            <option value={CustomerStatus.ACTIVE}>Active Only</option>
                            <option value={CustomerStatus.PENDING}>Pending / Leads</option>
                            <option value={CustomerStatus.SUSPENDED}>Suspended</option>
                        </Select>
                    </div>
                </Flex>
            </Flex>
            
            <div className="relative w-full h-[calc(100vh-220px)] min-h-[500px] bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden border-t border-gray-100 dark:border-slate-700">
                <div ref={mapRef} className="w-full h-full z-0" />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                    <Button size="sm" variant="secondary" onClick={setCenter} className="bg-white dark:bg-slate-800 shadow-md border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <Navigation className="w-4 h-4 mr-2" /> Recenter
                    </Button>
                </div>

                {validCustomers.length === 0 && (
                    <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl text-center border border-gray-200 dark:border-slate-700">
                            <MapIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-gray-900 dark:text-white font-bold">No mapped subscribers found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {customers.length > 0 
                                    ? "Subscribers exist but lack coordinate data." 
                                    : "Add subscribers with coordinates to populate the map."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    </div>
  );
};
