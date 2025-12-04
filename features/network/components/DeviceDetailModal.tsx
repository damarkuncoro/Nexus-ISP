
import React, { useState } from 'react';
import { NetworkDevice, DeviceType } from '../../../types';
import { Server, Wifi, Router, Box, Activity, Clock, Cpu, Network, CheckCircle2, BrainCircuit, Sparkles, AlertTriangle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { DeviceStatusBadge } from '../../../components/StatusBadges';
import { Flex } from '../../../components/ui/flex';
import { Grid, GridItem } from '../../../components/ui/grid';
import { Separator } from '../../../components/ui/separator';
import { BandwidthMonitor } from '../../../components/BandwidthMonitor';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { diagnoseDeviceWithAI, DeviceDiagnostic } from '../../../services/aiService';
import { useToast } from '../../../contexts/ToastContext';

const DeviceIcon = ({ type, className = "w-5 h-5" }: { type: DeviceType, className?: string }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={`${className} text-gray-500 dark:text-gray-400`} />;
};

interface DeviceDetailModalProps {
  device: NetworkDevice;
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ device, isOpen, onClose }) => {
  const [diagnostic, setDiagnostic] = useState<DeviceDiagnostic | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const toast = useToast();

  const displayStats = {
      firmware: device.firmware_version || 'N/A',
      serial: device.serial_number || 'N/A',
      model: device.model || 'Standard Device'
  };

  const interfaces = device.interfaces || [];

  const handleDiagnose = async () => {
      setIsDiagnosing(true);
      try {
          const result = await diagnoseDeviceWithAI(device);
          setDiagnostic(result);
          toast.success("AI Diagnostics Complete");
      } catch (err) {
          toast.error("Diagnostics failed. Check API key.");
      } finally {
          setIsDiagnosing(false);
      }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="sm:max-w-3xl">
        <DialogHeader>
            <Flex align="center" gap={3}>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <DeviceIcon type={device.type} className="w-6 h-6" />
                </div>
                <div>
                    <DialogTitle>{device.name}</DialogTitle>
                    <DialogDescription className="font-mono">{device.ip_address || '0.0.0.0'}</DialogDescription>
                </div>
            </Flex>
        </DialogHeader>

        <Tabs defaultValue="status" className="py-4">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="status"><Activity className="w-4 h-4 mr-2" /> Live Status</TabsTrigger>
                <TabsTrigger value="diagnostics"><BrainCircuit className="w-4 h-4 mr-2" /> AI Diagnostics</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-6">
                <Flex justify="between" className="bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-slate-800/50 dark:border-slate-700">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">Current Status</p>
                        <DeviceStatusBadge status={device.status} />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">Last Seen</p>
                        <Flex align="center" gap={1} className="text-sm font-medium text-gray-900 dark:text-white">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(device.last_check).toLocaleString()}
                        </Flex>
                    </div>
                </Flex>

                {/* Live Traffic */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-slate-800 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" /> Throughput
                    </h4>
                    <div className="h-40">
                        <BandwidthMonitor planSpeed="100 Mbps" isLive={device.status === 'online'} />
                    </div>
                </div>

                <Grid cols={1} className="md:grid-cols-2" gap={8}>
                    <GridItem>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-primary-500" /> Technical Specs</h4>
                        <div className="space-y-3 text-sm">
                            <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Device Type</span><span className="font-medium text-gray-900 dark:text-white capitalize">{device.type}</span></Flex>
                            <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Model</span><span className="font-medium text-gray-900 dark:text-white">{displayStats.model}</span></Flex>
                            <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Serial Number</span><span className="font-medium text-gray-900 dark:text-white font-mono">{displayStats.serial}</span></Flex>
                            <Flex justify="between" className="border-b border-gray-100 dark:border-slate-700 pb-2"><span className="text-gray-500 dark:text-gray-400">Firmware</span><span className="font-medium text-gray-900 dark:text-white">{displayStats.firmware}</span></Flex>
                            <Flex justify="between" className="pt-1"><span className="text-gray-500 dark:text-gray-400">Location</span><span className="font-medium text-gray-900 dark:text-white">{device.location || 'N/A'}</span></Flex>
                        </div>
                    </GridItem>

                    <GridItem>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary-500" /> Performance</h4>
                        <Grid cols={2} gap={4}>
                            <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uptime</p><p className="text-sm font-bold text-gray-900 dark:text-white">14d 2h</p></div>
                            <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latency</p><p className="text-sm font-bold text-gray-900 dark:text-white text-green-600 dark:text-green-400">12ms</p></div>
                            <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signal</p><p className="text-sm font-bold text-gray-900 dark:text-white">-45 dBm</p></div>
                            <div className="bg-white border border-gray-200 p-3 rounded-lg text-center dark:bg-slate-800 dark:border-slate-700"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Packet Loss</p><p className="text-sm font-bold text-gray-900 dark:text-white">0%</p></div>
                        </Grid>
                    </GridItem>
                </Grid>
                
                <Separator />
                
                {/* Interfaces List */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Network className="w-4 h-4 text-primary-500" /> Network Interfaces
                    </h4>
                    {interfaces.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 dark:border-slate-700 rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-slate-800/50">
                                        <TableHead>Interface</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead>MAC</TableHead>
                                        <TableHead className="text-right">State</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {interfaces.map((intf, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{intf.name}</TableCell>
                                            <TableCell className="capitalize text-xs">{intf.type}</TableCell>
                                            <TableCell className="font-mono text-xs">{intf.ip_address || '-'}</TableCell>
                                            <TableCell className="font-mono text-xs text-gray-500">{intf.mac_address || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={intf.status === 'up' ? 'success' : 'destructive'} className="text-[10px] h-5 px-1.5">
                                                    {intf.status?.toUpperCase() || 'UP'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No interfaces configured.</p>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-6">
                {!diagnostic ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900">
                        <Sparkles className="w-12 h-12 text-indigo-500 mb-4" />
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">Gemini Network Diagnostics</h3>
                        <p className="text-indigo-700 dark:text-indigo-300 max-w-sm mt-2 mb-6">
                            Use AI to analyze device telemetry, detect configuration anomalies, and suggest optimizations.
                        </p>
                        <Button 
                            onClick={handleDiagnose} 
                            isLoading={isDiagnosing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <BrainCircuit className="w-4 h-4 mr-2" /> Start Analysis
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Health Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-bold ${diagnostic.healthScore > 80 ? 'text-green-600' : diagnostic.healthScore > 50 ? 'text-amber-500' : 'text-red-600'}`}>
                                        {diagnostic.healthScore}
                                    </span>
                                    <span className="text-gray-400">/ 100</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className={`text-sm px-3 py-1 ${diagnostic.status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {diagnostic.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border-l-4 border-slate-400">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Analysis</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{diagnostic.analysis}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Recommendations
                                    </h4>
                                    <ul className="space-y-2">
                                        {diagnostic.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-emerald-700 dark:text-emerald-300 flex gap-2">
                                                <span className="font-bold">{i+1}.</span> {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-800">
                                    <h4 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Risks Detected
                                    </h4>
                                    <ul className="space-y-2">
                                        {diagnostic.potentialSecurityRisks.length > 0 ? (
                                            diagnostic.potentialSecurityRisks.map((risk, i) => (
                                                <li key={i} className="text-sm text-red-700 dark:text-red-300 flex gap-2">
                                                    <span>•</span> {risk}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500 italic">No major risks detected.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <Flex justify="end">
                            <Button variant="outline" size="sm" onClick={handleDiagnose} isLoading={isDiagnosing}>
                                Re-run Diagnostics
                            </Button>
                        </Flex>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    </Dialog>
  );
};
