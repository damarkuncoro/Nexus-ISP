
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../../types';
import { Save, ArrowLeft, Package, Tag, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Grid } from '../../../components/ui/grid';
import { Flex } from '../../../components/ui/flex';

interface InventoryFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: InventoryItem;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Device');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [minQuantity, setMinQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSku(initialData.sku);
      setCategory(initialData.category);
      setQuantity(initialData.quantity.toString());
      setUnit(initialData.unit);
      setMinQuantity(initialData.min_quantity.toString());
      setCostPrice(initialData.cost_price.toString());
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
        sku,
        category,
        quantity: parseInt(quantity) || 0,
        unit,
        min_quantity: parseInt(minQuantity) || 0,
        cost_price: parseFloat(costPrice) || 0,
        location,
        description
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-6">
         <Flex align="center" gap={4}>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300">
             <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Inventory' : 'Add Item'}</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage warehouse stock and equipment details</p>
           </div>
         </Flex>
      </div>

      <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-6">
                <Grid cols={2} gap={6}>
                    <div className="col-span-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fiber Drop Cable 2 Core" />
                    </div>
                    <div>
                        <Label htmlFor="sku">SKU / Code</Label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className="h-4 w-4 text-gray-400" /></div>
                            <Input id="sku" required className="pl-10" value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. CBL-DROP-2C" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select id="category" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="Device">Device (ONU, Router)</option>
                            <option value="Cable">Cable (Fiber, UTP)</option>
                            <option value="Accessory">Accessory (Patchcord, SFP)</option>
                            <option value="Tool">Tool</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>
                </Grid>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-gray-500" /> Stock & Valuation</h4>
                    <Grid cols={3} gap={6}>
                        <div>
                            <Label htmlFor="quantity">Current Stock</Label>
                            <Input id="quantity" type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="unit">Unit</Label>
                            <Select id="unit" value={unit} onChange={e => setUnit(e.target.value)}>
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="meters">Meters (m)</option>
                                <option value="box">Box</option>
                                <option value="roll">Roll</option>
                                <option value="pair">Pair</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="min">Min Threshold</Label>
                            <Input id="min" type="number" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} placeholder="5" />
                        </div>
                        <div>
                            <Label htmlFor="cost">Cost Price</Label>
                            <Input id="cost" type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="location">Warehouse Location</Label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                                <Input id="location" className="pl-10" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Shelf A, Van 1" />
                            </div>
                        </div>
                    </Grid>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" /> Additional Details</h4>
                    <Label htmlFor="description" className="mb-2 block">Description / Notes</Label>
                    <Textarea 
                        id="description" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Technical specs, compatibility notes, or vendor details..."
                        rows={3}
                    />
                </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50 p-6 border-t border-gray-100 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}><Save className="w-4 h-4 mr-2" /> Save Item</Button>
            </CardFooter>
          </form>
      </Card>
    </div>
  );
};
