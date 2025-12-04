
import React, { useState, useEffect } from 'react';
import { Subnet } from '../../../types';
import { Save, ArrowLeft, Network, MapPin, Hash, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Grid } from '../../../components/ui/grid';
import { Textarea } from '../../../components/ui/textarea';

interface SubnetFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Subnet, 'id' | 'created_at'>) => Promise<void>;
  initialData?: Subnet;
}

export const SubnetForm: React.FC<SubnetFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [cidr, setCidr] = useState('');
  const [gateway, setGateway] = useState('');
  const [vlanId, setVlanId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCidr(initialData.cidr);
      setGateway(initialData.gateway || '');
      setVlanId(initialData.vlan_id || '');
      setLocation(initialData.location || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        cidr,
        gateway: gateway || undefined,
        vlan_id: vlanId || undefined,
        location: location || undefined,
        description: description || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
         <Button 
           variant="ghost"
           onClick={onClose} 
         >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to IPAM
         </Button>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>{initialData ? 'Edit Subnet' : 'Add New Subnet'}</CardTitle>
            <CardDescription>Define a network range for IP Address Management.</CardDescription>
          </CardHeader>
            
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Subnet Name</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Network className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    required
                    className="pl-10"
                    placeholder="e.g. Management LAN"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <Grid cols={2} gap={6}>
                <div>
                  <Label htmlFor="cidr">CIDR Block</Label>
                  <Input
                    id="cidr"
                    required
                    placeholder="192.168.1.0/24"
                    value={cidr}
                    onChange={e => setCidr(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 1.2.3.4/24</p>
                </div>
                <div>
                  <Label htmlFor="gateway">Gateway IP</Label>
                  <Input
                    id="gateway"
                    placeholder="192.168.1.1"
                    value={gateway}
                    onChange={e => setGateway(e.target.value)}
                  />
                </div>
              </Grid>

              <Grid cols={2} gap={6}>
                <div>
                  <Label htmlFor="vlan">VLAN ID</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        id="vlan"
                        className="pl-10"
                        placeholder="10"
                        value={vlanId}
                        onChange={e => setVlanId(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        id="location"
                        className="pl-10"
                        placeholder="HQ Server Room"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </Grid>

              <div>
                  <Label htmlFor="description">Description</Label>
                  <div className="relative mt-1">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <Textarea
                        id="description"
                        className="pl-10"
                        placeholder="Purpose of this subnet..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                  </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50 p-6 border-t border-gray-100 dark:border-slate-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Subnet
                </Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};
