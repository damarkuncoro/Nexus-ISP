
import React, { useState } from 'react';
import { Customer, Ticket, NetworkDevice, SubscriptionPlan, InstallationStatus, CustomerStatus } from '../types';
import { ArrowLeft, Mail, Building, MapPin, Wifi, Calendar, Shield, CreditCard, LayoutDashboard, Plus, Router, HardHat, Phone, Globe, CheckCircle } from 'lucide-react';
import { TicketList } from './TicketList';
import { BillingSection } from './BillingSection';
import { CustomerDevices } from './CustomerDevices';
import { CustomerStatusBadge, InstallationStatusBadge } from './StatusBadges';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Flex } from './ui/flex';
import { Grid, GridItem } from './ui/grid';
import { Label } from './ui/label';
import { Input } from './ui/input';

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
  // Device Props
  devices?: NetworkDevice[];
  onAddDevice?: () => void;
  onEditDevice?: (device: NetworkDevice) => void;
  onDeleteDevice?: (id: string) => void;
  plans?: SubscriptionPlan[]; 
}

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
  plans = []
}) => {
  // Simple state for demoing "Save" on technical details
  const [odpPort, setOdpPort] = useState(customer.odp_port || '');
  const [coordinates, setCoordinates] = useState(customer.coordinates || '');

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        {/* Header with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 pb-6">
            <Button 
              variant="ghost"
              size="icon"
              onClick={onBack} 
              className="rounded-full bg-gray-100 hover:bg-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-gray-200">
                    <AvatarFallback className="bg-primary-100 text-primary-700 font-bold text-lg">
                        {customer.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {customer.name}
                        <CustomerStatusBadge status={customer.account_status} />
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{customer.id.slice(0,8)}</span>
                        {customer.account_status === CustomerStatus.LEAD && (
                            <InstallationStatusBadge status={customer.installation_status} />
                        )}
                    </div>
                </div>
              </div>
            </div>
        </div>

        <Tabs defaultValue="overview">
            <TabsList className="mb-6">
                <TabsTrigger value="overview">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="technical">
                    <HardHat className="w-4 h-4 mr-2" /> Installation & Tech
                </TabsTrigger>
                <TabsTrigger value="billing">
                    <CreditCard className="w-4 h-4 mr-2" /> Billing
                </TabsTrigger>
                <TabsTrigger value="devices">
                    <Router className="w-4 h-4 mr-2" /> Devices
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Details Grid */}
                    <Card>
                        <CardHeader className="py-4">
                            <h2 className="text-lg font-medium text-gray-900 m-0">Subscriber Information</h2>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{customer.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone / WA</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{customer.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Building className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Company</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {customer.type === 'corporate' ? customer.company : 'Residential'}
                                    </p>
                                    <p className="text-xs text-gray-400">{customer.identity_number || 'No ID'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service Address</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{customer.address || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Wifi className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</p>
                                    {customer.plan_id && onPlanClick ? (
                                        <button 
                                        onClick={() => onPlanClick(customer.plan_id!)}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline mt-1 text-left"
                                        >
                                        {customer.subscription_plan || 'Standard'}
                                        </button>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 mt-1">{customer.subscription_plan || 'Standard'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Since</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{new Date(customer.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Associated Tickets */}
                    <Card>
                        <CardHeader className="py-4 flex flex-row justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-medium text-gray-900 m-0">Support Ticket History</h2>
                                <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    {tickets.length}
                                </span>
                            </div>
                            {onCreateTicket && (
                                <Button size="sm" onClick={onCreateTicket}>
                                    <Plus className="w-3 h-3 mr-1" /> New Ticket
                                </Button>
                            )}
                        </CardHeader>
                        
                        <CardContent className="p-0">
                            {tickets.length > 0 ? (
                                <div className="border-t border-gray-100">
                                    <TicketList 
                                        tickets={tickets} 
                                        onEdit={onTicketEdit} 
                                        onDelete={onTicketDelete} 
                                        onTicketClick={onTicketClick}
                                        compact 
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Shield className="mx-auto h-12 w-12 text-gray-300" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                                    <p className="mt-1 text-sm text-gray-500">This customer hasn't reported any issues yet.</p>
                                    {onCreateTicket && (
                                        <button 
                                            onClick={onCreateTicket}
                                            className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Create their first ticket &rarr;
                                        </button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="technical">
                <div className="space-y-6 animate-in fade-in duration-300">
                    <Card>
                        <CardHeader className="py-4">
                            <h2 className="text-lg font-medium text-gray-900">Infrastructure Mapping</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Workflow Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <Label className="text-gray-500 text-xs uppercase mb-2 block">Current Installation Stage</Label>
                                <Flex align="center" gap={4}>
                                    <InstallationStatusBadge status={customer.installation_status} />
                                    {customer.installation_status === InstallationStatus.PENDING_SURVEY && (
                                        <Button size="sm" variant="outline">Schedule Survey</Button>
                                    )}
                                    {customer.installation_status === InstallationStatus.SURVEY_COMPLETED && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Activate Service</Button>
                                    )}
                                </Flex>
                            </div>

                            <Grid cols={1} className="md:grid-cols-2" gap={6}>
                                <div>
                                    <Label className="mb-1">ODP Port / FDT</Label>
                                    <Input 
                                        value={odpPort} 
                                        onChange={(e) => setOdpPort(e.target.value)} 
                                        placeholder="e.g. ODP-JKT-01/4" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Optical Distribution Point assignment.</p>
                                </div>
                                <div>
                                    <Label className="mb-1">Geo Coordinates</Label>
                                    <div className="relative">
                                        <Input 
                                            value={coordinates} 
                                            onChange={(e) => setCoordinates(e.target.value)} 
                                            placeholder="-6.123, 106.123" 
                                        />
                                        <Globe className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Latitude, Longitude for map visualization.</p>
                                </div>
                            </Grid>

                            <div className="flex justify-end border-t border-gray-100 pt-4">
                                <Button>Save Technical Data</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="billing">
                <div className="animate-in fade-in duration-300">
                    <BillingSection customer={customer} currency={currency} plans={plans} />
                </div>
            </TabsContent>

            <TabsContent value="devices">
                <div className="animate-in fade-in duration-300">
                    <CustomerDevices 
                        devices={devices} 
                        onAddDevice={onAddDevice ?? (() => {})} 
                        onEditDevice={onEditDevice ?? (() => {})} 
                        onDeleteDevice={onDeleteDevice ?? (() => {})}
                    />
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
};
