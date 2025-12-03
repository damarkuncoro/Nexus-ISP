
import React, { useState } from 'react';
import { Customer, CustomerStatus, SubscriptionPlan, CustomerType, InstallationStatus } from '../../types';
import { Save, ArrowLeft, User, MapPin, Wifi } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Flex } from '../ui/flex';
import { Grid, GridItem } from '../ui/grid';

interface CustomerFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
  plans?: SubscriptionPlan[];
  currency: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onClose, onSubmit, plans = [], currency }) => {
  // Identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>(CustomerType.RESIDENTIAL);
  const [identityNumber, setIdentityNumber] = useState('');
  const [company, setCompany] = useState('');
  
  // Location
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  
  // Service
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [accountStatus, setAccountStatus] = useState<CustomerStatus>(CustomerStatus.LEAD);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  const hasPlans = plans && plans.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    try {
      await onSubmit({ 
        name, 
        email, 
        phone,
        type,
        identity_number: identityNumber || undefined,
        company: type === CustomerType.CORPORATE ? company : undefined,
        address: address || undefined,
        coordinates: coordinates || undefined,
        plan_id: selectedPlanId || undefined,
        subscription_plan: selectedPlan ? selectedPlan.name : undefined,
        account_status: accountStatus,
        installation_status: InstallationStatus.PENDING_SURVEY
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTab = () => {
      if (activeTab === 'identity') setActiveTab('location');
      else if (activeTab === 'location') setActiveTab('service');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 border-b border-gray-200 pb-6">
         <Flex align="center" gap={4}>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-gray-100 hover:bg-gray-200">
             <ArrowLeft className="w-5 h-5 text-gray-600" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold text-gray-900">New Registration</h1>
             <p className="text-sm text-gray-500 mt-1">Input prospective customer details for survey and installation</p>
           </div>
         </Flex>
      </div>

      <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
                <Tabs defaultValue="identity" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="identity"><User className="w-4 h-4 mr-2" />1. Identity</TabsTrigger>
                        <TabsTrigger value="location"><MapPin className="w-4 h-4 mr-2" />2. Location</TabsTrigger>
                        <TabsTrigger value="service"><Wifi className="w-4 h-4 mr-2" />3. Service</TabsTrigger>
                    </TabsList>

                    <TabsContent value="identity" className="space-y-6">
                        <Grid cols={2} gap={6}>
                            <GridItem colSpan={2}>
                                <Label htmlFor="type" className="mb-1 block">Customer Type</Label>
                                <Select value={type} onChange={(e) => setType(e.target.value as CustomerType)}>
                                    <option value={CustomerType.RESIDENTIAL}>Residential (Personal)</option>
                                    <option value={CustomerType.CORPORATE}>Corporate (Business)</option>
                                </Select>
                            </GridItem>
                            <div>
                                <Label htmlFor="name" className="mb-1 block">Full Name / PIC</Label>
                                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                            </div>
                            {type === CustomerType.CORPORATE && (<div><Label htmlFor="company" className="mb-1 block">Company Name</Label><Input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." /></div>)}
                            <div>
                                <Label htmlFor="identity" className="mb-1 block">{type === CustomerType.CORPORATE ? 'NPWP / SIUP' : 'KTP / ID Number'}</Label>
                                <Input required value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} placeholder="Identity Number" />
                            </div>
                            <div>
                                <Label htmlFor="phone" className="mb-1 block">WhatsApp / Phone</Label>
                                <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." />
                            </div>
                            <div>
                                <Label htmlFor="email" className="mb-1 block">Email Address</Label>
                                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                            </div>
                        </Grid>
                        <Flex justify="end"><Button type="button" onClick={handleNextTab}>Next Step</Button></Flex>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-6">
                        <div><Label htmlFor="address" className="mb-1 block">Full Installation Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Number, RT/RW, District" /></div>
                        <div><Label htmlFor="coords" className="mb-1 block">Coordinates (Lat, Long)</Label><Input value={coordinates} onChange={(e) => setCoordinates(e.target.value)} placeholder="-6.200000, 106.816666" /><p className="text-xs text-gray-500 mt-1">Required for Fiber Feasibility Survey.</p></div>
                        <Flex justify="end"><Button type="button" onClick={handleNextTab}>Next Step</Button></Flex>
                    </TabsContent>

                    <TabsContent value="service" className="space-y-6">
                        <div>
                            <Label htmlFor="plan" className="mb-1 block">Desired Service Plan</Label>
                            {hasPlans ? (<Select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}><option value="">-- Select Plan --</option>{plans.map(plan => (<option key={plan.id} value={plan.id}>{plan.name} ({formatCurrency(plan.price, currency)})</option>))}</Select>) : (<Input disabled placeholder="No plans defined" />)}
                        </div>
                        <div>
                            <Label htmlFor="status" className="mb-1 block">Initial Status</Label>
                            <Select value={accountStatus} onChange={(e) => setAccountStatus(e.target.value as CustomerStatus)}>
                                <option value={CustomerStatus.LEAD}>Lead (Prospect)</option>
                                <option value={CustomerStatus.PENDING}>Pending Activation</option>
                                <option value={CustomerStatus.ACTIVE}>Active (Skip Survey)</option>
                            </Select>
                        </div>
                        <Flex justify="end" className="pt-4"><Button type="submit" disabled={isSubmitting} isLoading={isSubmitting} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Create Registration</Button></Flex>
                    </TabsContent>
                </Tabs>
            </CardContent>
          </form>
      </Card>
    </div>
  );
};
