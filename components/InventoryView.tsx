
import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '../types';
import { useInventory } from '../hooks/useInventory';
import { Package, Search, AlertTriangle, TrendingUp, Plus, Edit2, Trash2, Filter, LayoutGrid, List, MoreHorizontal, MapPin, Tag } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';
import { Badge } from './ui/badge';
import { EmptyState } from './ui/empty-state';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

interface InventoryViewProps {
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  currency: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onAddItem, onEditItem, currency }) => {
  const { items, loadInventory, removeItem, loading } = useInventory();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCat = filterCategory === 'All' || item.category === filterCategory;
        return matchesSearch && matchesCat;
    });
  }, [items, search, filterCategory]);

  const stats = useMemo(() => {
      const totalItems = items.length;
      const lowStock = items.filter(i => i.quantity <= i.min_quantity).length;
      const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.cost_price), 0);
      return { totalItems, lowStock, totalValue };
  }, [items]);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const StockBadge = ({ item }: { item: InventoryItem }) => {
      if (item.quantity === 0) return <Badge variant="destructive" className="h-5">Out of Stock</Badge>;
      if (item.quantity <= item.min_quantity) return <Badge variant="warning" className="h-5">Low Stock</Badge>;
      return <Badge variant="success" className="h-5">In Stock</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Grid cols={1} className="md:grid-cols-3" gap={6}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total SKU</p><p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalItems}</p></div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><Package className="w-6 h-6" /></div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Low Stock Alerts</p><p className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-1">{stats.lowStock}</p></div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400"><AlertTriangle className="w-6 h-6" /></div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Valuation</p><p className="text-3xl font-bold text-green-600 dark:text-green-500 mt-1">{formatCurrency(stats.totalValue, currency)}</p></div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400"><TrendingUp className="w-6 h-6" /></div>
            </div>
        </Grid>

        <div className="space-y-4">
            <Flex className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex-col sm:flex-row gap-4 justify-between items-center">
                <Flex gap={4} className="w-full sm:w-auto flex-1">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <Input className="pl-10" placeholder="Search name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select 
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </Flex>
                
                <Flex gap={3} className="w-full sm:w-auto justify-between sm:justify-end">
                    <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg flex items-center">
                        <button 
                            onClick={() => setViewMode('table')} 
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-gray-900 dark:bg-slate-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-gray-900 dark:bg-slate-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    {hasPermission('manage_network') && (
                        <Button onClick={onAddItem}><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
                    )}
                </Flex>
            </Flex>

            {filteredItems.length > 0 ? (
                viewMode === 'table' ? (
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Stock Level</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map(item => (
                                        <TableRow key={item.id} className="group">
                                            <TableCell>
                                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.sku}</p>
                                            </TableCell>
                                            <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <StockBadge item={item} />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200 ml-1">{item.quantity} {item.unit}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">{item.location || '-'}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">{formatCurrency(item.cost_price, currency)}</TableCell>
                                            <TableCell className="text-right">
                                                {hasPermission('manage_network') && (
                                                    <Flex justify="end" gap={1} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => onEditItem(item)}><Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button></AlertDialogTrigger>
                                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Item?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeItem(item.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                        </AlertDialog>
                                                    </Flex>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid cols={1} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap={6}>
                        {filteredItems.map(item => {
                            const isLowStock = item.quantity <= item.min_quantity;
                            const isOutOfStock = item.quantity === 0;
                            const statusColor = isOutOfStock ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : isLowStock ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800' : 'border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700';

                            return (
                                <Card key={item.id} className={`hover:shadow-md transition-all ${isLowStock || isOutOfStock ? 'border-2' : ''} ${statusColor}`}>
                                    <CardContent className="p-5">
                                        <Flex justify="between" align="start" className="mb-3">
                                            <Badge variant="secondary" className="bg-white/80 dark:bg-slate-700/80">{item.category}</Badge>
                                            {hasPermission('manage_network') && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => onEditItem(item)}>
                                                            <Edit2 className="w-4 h-4 mr-2" /> Edit Item
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 w-full">
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                </div>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Delete Item?</AlertDialogTitle><AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeItem(item.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </Flex>
                                        
                                        <div className="mb-4">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2" title={item.name}>{item.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 flex items-center gap-1">
                                                <Tag className="w-3 h-3" /> {item.sku}
                                            </p>
                                        </div>

                                        <div className="bg-white/60 dark:bg-slate-700/30 rounded-lg p-3 border border-black/5 dark:border-white/5">
                                            <Flex justify="between" align="end">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Stock</p>
                                                    <p className={`text-2xl font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {item.quantity} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.unit}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Value</p>
                                                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-200">{formatCurrency(item.cost_price, currency)}</p>
                                                </div>
                                            </Flex>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <Flex align="center" gap={1}>
                                                <MapPin className="w-3 h-3" /> {item.location || 'No Location'}
                                            </Flex>
                                            {item.min_quantity > 0 && <span>Min: {item.min_quantity}</span>}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Grid>
                )
            ) : (
                <div className="p-12 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 border-dashed">
                    <EmptyState icon={Package} title="No items found" message="Adjust your filters or add new inventory." />
                </div>
            )}
        </div>
    </div>
  );
};
