
import React, { useState, useEffect, useRef } from 'react';
import { Customer, Ticket, NetworkDevice, SubscriptionPlan, InstallationStatus, CustomerStatus, CustomerType, AuditAction } from '../types';
import { ArrowLeft, Mail, Building, MapPin, Wifi, Calendar, Shield, CreditCard, LayoutDashboard, Plus, Router, HardHat, Phone, Globe, CheckCircle, FileText, Activity, Clock, FileClock, User } from 'lucide-react';
import { TicketList } from './TicketList';
import { BillingSection } from './BillingSection';
import { CustomerDevices } from './CustomerDevices';
import { CustomerStatusBadge, InstallationStatusBadge } from './StatusBadges';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Flex } from './ui/flex';
import { Grid, GridItem } from './ui/grid';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { BandwidthMonitor } from './BandwidthMonitor';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { useAuditLogs } from '../hooks/useAuditLogs';
import * as L from 'leaflet';

interface CustomerDetailProps {
  customer: Customer;
  tickets: Ticket[];
  onBack: () => void;
  onTicketEdit: (ticket: Ticket) => void;
  onTicketDelete: (id: string) => void;
  currency?: string;
  onPlanClick?: (planId: string) => void;
  onCreateTicket?: () => void;
  onTicketClick?: (ticket: Ticket) => void;
  devices?: NetworkDevice[];
  onAddDevice?: () => void;
  onEditDevice?: (device: NetworkDevice) => void;
  onDeleteDevice?: (id: string) => void;
  plans?: SubscriptionPlan[]; 
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
}

// Internal Map Component
const MapPicker = ({ coordinates, onChange }: { coordinates: string, onChange: (val: string) => void }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  // Parse lat,long safely
  const [lat, lng] = coordinates.split(',').map(s => parseFloat(s.trim()));
  // Default to Jakarta Monas if invalid
  const defaultCenter: [number, number] = [-6.1751, 106.8272]; 
  const center: [number, number] = (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : defaultCenter;

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return; // Prevent double init

    const map = L.map(mapRef.current).setView(center, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Fix for Leaflet default icons in this build environment
    const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const marker = L.marker(center, { draggable: true, icon }).addTo(map);
    
    marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });

    map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
    });

    mapInstance.current = map;
    markerInstance.current = marker;

    // Cleanup
    return () => {
        map.remove();
        mapInstance.current = null;
    }
  }, []);

  // Update map if coordinates prop changes externally (e.g. from input typing)
  useEffect(() => {
     if(markerInstance.current && mapInstance.current && !isNaN(lat) && !isNaN(lng)) {
         const cur = markerInstance.current.getLatLng();
         // Only update if significantly different to avoid jitter
         if(Math.abs(cur.lat - lat) > 0.0001 || Math.abs(cur.lng - lng) > 0.0001) {
             markerInstance.current.setLatLng([lat, lng]);
             mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
         }
     }
  }, [coordinates]);

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 shadow-sm z-0">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-800/90 px-2 py-1 text-[10px] text-gray-500 dark:text-gray-300 rounded z-[400] pointer-events-none">
            Drag marker or click to set position
        </div>
    </div>
  );
};

const ActivityTimeline = ({ customerId }: { customerId: string }) => {
    const { logs, loadLogsByEntity } = useAuditLogs();

    useEffect(() => {
        loadLogsByEntity('Customer', customerId);
    }, [loadLogsByEntity, customerId]);

    if (logs.length === 0) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">No recent activity recorded.</div>;
    }

    return (
        <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-4 space-y-8 my-4">
            {logs.map((log) => {
                let Icon = FileText;
                let bgClass = "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300";
                
                if (log.action === AuditAction.CREATE) { Icon = Plus; bgClass = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"; }
                if (log.action === AuditAction.UPDATE) { Icon = FileClock; bgClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"; }
                if (log.action === AuditAction.DELETE) { Icon = Shield; bgClass = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"; }

                return (
                    <div key={log.id} className="relative pl-8">
                        <span className={`absolute -left-[11px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${bgClass}`}>
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{log.action} Action</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{log.details}</p>
                            </div>
                            <div className="whitespace-nowrap text-right">
                                <time className="text-xs text-gray-400 block">{new Date(log.created_at).toLocaleString()}</time>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center justify-end gap-1 mt-0.5">
                                    <User className="w-3 h-3" /> {log.performed_by}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  customer, 
  tickets, 
  onBack,
  onTicketEdit,
  onTicketDelete,
  currency = 'USD',
  onPlanClick,
  onCreateTicket,
  onTicketClick,
  devices = [],
  onAddDevice,
  onEditDevice,
  onDeleteDevice,
  plans = [],
  onUpdateCustomer
}) => {
  const [odpPort, setOdpPort] = useState(customer.odp_port || '');
  const [coordinates, setCoordinates] = useState(customer.coordinates || '');
  const [surveyNotes, setSurveyNotes] = useState(customer.survey_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setOdpPort(customer.odp_port || '');
    setCoordinates(customer.coordinates || '');
    setSurveyNotes(customer.survey_notes || '');
  }, [customer]);

  const handleSaveTechData = async () => {
    setIsSaving(true);
    try {
      await onUpdateCustomer(customer.id, { 
          odp_port: odpPort, 
          coordinates,
          survey_notes: surveyNotes
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus: InstallationStatus) => {
    setIsUpdatingStatus(true);
    try {
        await onUpdateCustomer(customer.id, { installation_status: newStatus });
    } finally {
        setIsUpdatingStatus(false);
    }
  };

  const currentPlan = plans.find(p => p.name === customer.subscription_plan) || plans[0];
  const downloadSpeed = currentPlan ? currentPlan.download_speed : '50 Mbps';

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-6">
            <Button 
              variant="ghost"
              size="icon"
              onClick={onBack} 
              className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300"
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-gray-200 dark:border-slate-700">
                    <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-bold text-lg">
                        {customer.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {customer.name}
                        <CustomerStatusBadge status={customer.account_status} />
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">{customer.id.slice(0,8)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${customer.type === CustomerType.CORPORATE ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                          {customer.type}
                        </span>
                    </div>
                </div>
              </div>
            </div>
        </div>

        <Tabs defaultValue="overview">
            <TabsList className="mb-6">
                <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
                <TabsTrigger value="usage"><Activity className="w-4 h-4 mr-2" /> Network Usage</TabsTrigger>
                <TabsTrigger value="technical"><HardHat className="w-4 h-4 mr-2" /> Installation & Tech</TabsTrigger>
                <TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" /> Billing</TabsTrigger>
                <TabsTrigger value="devices"><Router className="w-4 h-4 mr-2" /> Devices</TabsTrigger>
                <TabsTrigger value="activity"><FileClock className="w-4 h-4 mr-2" /> Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card>
                        <CardHeader className="py-4"><h2 className="text-lg font-medium text-gray-900 dark:text-white m-0">Subscriber Information</h2></CardHeader>
                        <CardContent>
                          <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3" gap={6}>
                            <InfoItem icon={Mail} label="Email" value={customer.email} color="blue" />
                            <InfoItem icon={Phone} label="Phone / WA" value={customer.phone || 'N/A'} color="green" />
                            <InfoItem icon={Building} label="Type / Company" value={customer.type === 'corporate' ? customer.company : 'Residential'} subValue={customer.identity_number || 'No ID'} color="purple" />
                            <InfoItem icon={MapPin} label="Service Address" value={customer.address || 'N/A'} color="amber" />
                            <InfoItem icon={Wifi} label="Current Plan" value={customer.subscription_plan || 'Standard'} isButton={!!customer.plan_id} onClick={() => customer.plan_id && onPlanClick && onPlanClick(customer.plan_id)} color="emerald" />
                            <InfoItem icon={Calendar} label="Registered Since" value={new Date(customer.created_at).toLocaleDateString()} color="gray" />
                          </Grid>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-4 flex flex-row justify-between items-center">
                            <div className="flex items-center gap-3"><h2 className="text-lg font-medium text-gray-900 dark:text-white m-0">Support Ticket History</h2><span className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{tickets.length}</span></div>
                            {onCreateTicket && (<Button size="sm" onClick={onCreateTicket}><Plus className="w-3 h-3 mr-1" /> New Ticket</Button>)}
                        </CardHeader>
                        <CardContent className="p-0">
                            {tickets.length > 0 ? (<div className="border-t border-gray-100 dark:border-slate-700"><TicketList tickets={tickets} onEdit={onTicketEdit} onDelete={onTicketDelete} onTicketClick={onTicketClick} compact /></div>) : (<div className="text-center py-12"><Shield className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600" /><h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No tickets found</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This customer hasn't reported any issues yet.</p>{onCreateTicket && (<button onClick={onCreateTicket} className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium">Create their first ticket &rarr;</button>)}</div>)}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="usage">
                <div className="animate-in fade-in duration-300 space-y-6">
                    <BandwidthMonitor planSpeed={downloadSpeed} isLive={customer.account_status === CustomerStatus.ACTIVE} />
                    
                    <Card>
                        <CardHeader className="py-4"><CardTitle className="text-base">PPPoE Session History</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Termination Cause</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="flex items-center gap-2"><Clock className="w-3 h-3 text-green-500" /> {new Date().toLocaleDateString()} 08:00:00</TableCell>
                                        <TableCell><span className="text-green-600 font-medium text-xs bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">Active</span></TableCell>
                                        <TableCell>running...</TableCell>
                                        <TableCell className="font-mono text-xs">10.20.100.12</TableCell>
                                        <TableCell>-</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{new Date(Date.now() - 86400000).toLocaleDateString()} 09:15:20</TableCell>
                                        <TableCell>{new Date(Date.now() - 3600000).toLocaleDateString()} 08:00:00</TableCell>
                                        <TableCell>22h 44m</TableCell>
                                        <TableCell className="font-mono text-xs">10.20.100.12</TableCell>
                                        <TableCell className="text-gray-500 dark:text-gray-400 text-xs">Client Request</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{new Date(Date.now() - 172800000).toLocaleDateString()} 08:00:00</TableCell>
                                        <TableCell>{new Date(Date.now() - 86400000).toLocaleDateString()} 09:10:00</TableCell>
                                        <TableCell>25h 10m</TableCell>
                                        <TableCell className="font-mono text-xs">10.20.100.12</TableCell>
                                        <TableCell className="text-red-500 dark:text-red-400 text-xs">Lost Carrier</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="technical">
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card>
                        <CardHeader className="py-4"><h2 className="text-lg font-medium text-gray-900 dark:text-white">Infrastructure Mapping & Workflow</h2></CardHeader>
                        <CardContent className="space-y-6">
                            
                            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                                    <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-2 block">Current Installation Stage</Label>
                                    <Flex align="center" gap={4} wrap="wrap">
                                        <InstallationStatusBadge status={customer.installation_status} />
                                        {customer.installation_status === InstallationStatus.PENDING_SURVEY && <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(InstallationStatus.SCHEDULED)} isLoading={isUpdatingStatus}>Schedule Survey</Button>}
                                        {customer.installation_status === InstallationStatus.SCHEDULED && <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(InstallationStatus.SURVEY_COMPLETED)} isLoading={isUpdatingStatus}>Complete Survey</Button>}
                                        {customer.installation_status === InstallationStatus.SURVEY_COMPLETED && <Button size="sm" onClick={() => handleStatusUpdate(InstallationStatus.INSTALLED)} isLoading={isUpdatingStatus} className="bg-green-600 hover:bg-green-700">Mark as Installed</Button>}
                                    </Flex>
                                </div>
                                <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50">
                                     <Label className="mb-2 block flex items-center gap-2 dark:text-gray-300">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Survey / Installation Notes
                                    </Label>
                                    <Textarea 
                                        value={surveyNotes} 
                                        onChange={(e) => setSurveyNotes(e.target.value)} 
                                        placeholder="Enter survey results, installation obstacles, or technical notes..."
                                        rows={3}
                                        className="bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <Grid cols={1} className="md:grid-cols-2" gap={6}>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="mb-1 dark:text-gray-300">ODP Port / FDT</Label>
                                        <Input value={odpPort} onChange={(e) => setOdpPort(e.target.value)} placeholder="e.g. ODP-JKT-01/4" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optical Distribution Point assignment.</p>
                                    </div>
                                    <div>
                                        <Label className="mb-1 dark:text-gray-300">Geo Coordinates</Label>
                                        <div className="relative">
                                            <Input value={coordinates} onChange={(e) => setCoordinates(e.target.value)} placeholder="-6.123, 106.123" />
                                            <Globe className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lat, Long. Use the map to adjust.</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <Label className="mb-1 dark:text-gray-300">Coverage Map</Label>
                                    <MapPicker coordinates={coordinates} onChange={setCoordinates} />
                                </div>
                            </Grid>

                            <div className="flex justify-end border-t border-gray-100 dark:border-slate-700 pt-4">
                                <Button onClick={handleSaveTechData} isLoading={isSaving}>Save Technical Data</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="billing"><div className="animate-in fade-in duration-300"><BillingSection customer={customer} currency={currency} plans={plans} /></div></TabsContent>
            <TabsContent value="devices"><div className="animate-in fade-in duration-300"><CustomerDevices devices={devices} onAddDevice={onAddDevice ?? (() => {})} onEditDevice={onEditDevice ?? (() => {})} onDeleteDevice={onDeleteDevice ?? (() => {})} /></div></TabsContent>
            
            <TabsContent value="activity">
                <div className="animate-in fade-in duration-300">
                    <Card>
                        <CardHeader className="py-4 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <FileClock className="w-5 h-5 text-gray-500" /> Activity Log
                            </h2>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ActivityTimeline customerId={customer.id} />
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
};

// Reusable Info Item sub-component for the Overview tab
const InfoItem = ({ icon: Icon, label, value, subValue, color, isButton, onClick }: any) => (
  <Flex align="start" gap={3}>
      <div className={`p-2 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          {isButton ? (
              <button onClick={onClick} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:underline mt-1 text-left">{value}</button>
          ) : (
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-1">{value}</p>
          )}
          {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{subValue}</p>}
      </div>
  </Flex>
);
