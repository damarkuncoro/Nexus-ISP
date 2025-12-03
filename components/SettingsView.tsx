import React, { useState } from 'react';
import { Copy, Check, Database, Server, ShieldCheck, Download, Globe, Loader2 } from 'lucide-react';
import { SETUP_SQL, SUPABASE_URL } from '../constants';
import { AVAILABLE_CURRENCIES } from '../utils/formatters';
import { CategorySettings } from './settings/CategorySettings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Label } from './ui/label';
import { Grid, GridItem } from './ui/grid';

interface SettingsViewProps {
  connectionStatus: 'connected' | 'error' | 'loading';
  currency: string;
  onCurrencyChange: (code: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  connectionStatus, 
  currency,
  onCurrencyChange
}) => {
  const [copied, setCopied] = useState(false);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([SETUP_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setIsSavingCurrency(true);
    try {
      await onCurrencyChange(newCurrency);
    } catch (err) {
      alert("Failed to save currency setting.");
    } finally {
      setIsSavingCurrency(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <Tabs defaultValue="general">
          <TabsList className="mb-6">
              <TabsTrigger value="general">General & System</TabsTrigger>
              <TabsTrigger value="categories">Ticket Categories & SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Grid cols={1} className="md:grid-cols-2" gap={6}>
                <Card>
                    <CardHeader className="py-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 m-0"><Server className="w-5 h-5 text-gray-500" />System Status</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500">Database Connection</p>
                            <div className="mt-2 flex items-center gap-2"><span className={`flex w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} /> <span className="text-sm text-gray-900 font-medium">{connectionStatus === 'connected' ? 'Connected to Supabase' : 'Connection Failed'}</span></div>
                            <p className="text-xs text-gray-400 mt-1 truncate">{SUPABASE_URL}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Environment</p>
                            <div className="mt-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary-500" /> <span className="text-sm text-gray-900">Production Mode</span></div>
                            <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 m-0"><Globe className="w-5 h-5 text-gray-500" />Regional Settings</h3>
                    </CardHeader>
                    <CardContent>
                        <Label className="mb-2 block">Display Currency</Label>
                        <div className="relative">
                          <Select value={currency} onChange={handleCurrencyChange} disabled={isSavingCurrency}>
                              {AVAILABLE_CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                          </Select>
                          {isSavingCurrency && (<div className="absolute right-8 top-3"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>)}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">This setting affects how plan prices are displayed.</p>
                    </CardContent>
                </Card>

                <GridItem className="md:col-span-2">
                    <Card>
                        <CardHeader className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 m-0"><Database className="w-5 h-5 text-gray-500" />Database Configuration (SQL)</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={handleDownloadSQL}><Download className="w-4 h-4 mr-2" />Download .sql</Button>
                                <Button variant="outline" size="sm" onClick={handleCopySQL} className="text-primary-700 bg-primary-50 hover:bg-primary-100 border-primary-200">{copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}{copied ? 'Copied!' : 'Copy Script'}</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">Run this SQL script in your Supabase SQL Editor to create all necessary tables and relationships.</p>
                            <div className="relative group"><pre className="p-4 bg-slate-900 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto border border-slate-700 leading-relaxed shadow-inner h-64">{SETUP_SQL}</pre></div>
                        </CardContent>
                    </Card>
                </GridItem>
            </Grid>
          </TabsContent>

          <TabsContent value="categories">
            <CategorySettings />
          </TabsContent>
      </Tabs>
    </div>
  );
};
