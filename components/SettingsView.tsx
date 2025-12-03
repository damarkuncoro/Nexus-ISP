
import React, { useState } from 'react';
import { Copy, Check, Database, Server, ShieldCheck, Download, Globe, Loader2, Tag, Building2, FileText } from 'lucide-react';
import { SETUP_SQL, SUPABASE_URL } from '../constants';
import { AVAILABLE_CURRENCIES } from '../utils/formatters';
import { CategorySettings } from './settings/CategorySettings';
import { DepartmentSettings } from './settings/DepartmentSettings';
import { AuditLogViewer } from './settings/AuditLogViewer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { Grid, GridItem } from './ui/grid';
import { Flex } from './ui/flex';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface SettingsViewProps {
  connectionStatus: 'connected' | 'error' | 'loading';
  currency: string;
  onCurrencyChange: (code: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ connectionStatus, currency, onCurrencyChange }) => {
  const [copied, setCopied] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const { hasPermission } = useAuth();
  const toast = useToast();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    toast.success("SQL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCurrency = e.target.value;
      setIsSavingCurrency(true);
      try {
          await onCurrencyChange(newCurrency);
          toast.success("Currency updated");
      } catch (err) {
          toast.error("Failed to update currency");
      } finally {
          setIsSavingCurrency(false);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
            <TabsTrigger value="general"><Globe className="w-4 h-4 mr-2" />General</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-2" />Categories</TabsTrigger>
            <TabsTrigger value="departments"><Building2 className="w-4 h-4 mr-2" />Departments</TabsTrigger>
            {hasPermission('manage_settings') && <TabsTrigger value="audit"><FileText className="w-4 h-4 mr-2" />Audit Logs</TabsTrigger>}
            <TabsTrigger value="database"><Database className="w-4 h-4 mr-2" />Database</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure regional and application preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-md">
                        <Label htmlFor="currency" className="mb-2 block">System Currency</Label>
                        <Flex gap={2}>
                            <Select 
                                id="currency" 
                                value={currency} 
                                onChange={handleCurrencyChange}
                                disabled={isSavingCurrency || !hasPermission('manage_settings')}
                            >
                                {AVAILABLE_CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </Select>
                            {isSavingCurrency && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                        </Flex>
                        <p className="text-xs text-gray-500 mt-2">Used for all billing and plan pricing.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="categories">
            <CategorySettings />
        </TabsContent>

        <TabsContent value="departments">
            <DepartmentSettings />
        </TabsContent>

        {hasPermission('manage_settings') && (
            <TabsContent value="audit">
                <AuditLogViewer />
            </TabsContent>
        )}

        <TabsContent value="database">
            <Grid cols={1} className="lg:grid-cols-2" gap={6}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5"/> Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Flex align="center" gap={3} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                                <p className="font-medium text-gray-900 capitalize">{connectionStatus}</p>
                                <p className="text-xs text-gray-500 break-all">{SUPABASE_URL}</p>
                            </div>
                        </Flex>
                    </CardContent>
                </Card>

                {hasPermission('manage_settings') && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Database Setup & Reset</CardTitle>
                            <CardDescription>Run this SQL in your Supabase SQL Editor to initialize or reset the schema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative group">
                                <pre className="p-4 bg-gray-900 text-gray-300 rounded-lg text-xs font-mono overflow-x-auto border border-gray-700 max-h-96">
                                    {SETUP_SQL}
                                </pre>
                                <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={handleCopySQL} 
                                    className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                                >
                                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                    {copied ? 'Copied' : 'Copy SQL'}
                                </Button>
                            </div>
                            <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 flex gap-3">
                                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">Admin Notice</p>
                                    <p className="text-xs mt-1">Running this SQL script will <strong>delete all existing data</strong> and reset the tables to their default state. Use with caution.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </TabsContent>
      </Tabs>
    </div>
  );
};
