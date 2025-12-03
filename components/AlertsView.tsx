
import React, { useState, useEffect } from 'react';
import { Alert, Ticket, TicketStatus, TicketPriority } from '../types';
import { useAlerts } from '../hooks/useAlerts';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Server, RefreshCw, Ticket as TicketIcon, Activity, Zap } from 'lucide-react';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';
import { EmptyState } from './ui/empty-state';
import { useToast } from '../contexts/ToastContext';

interface AlertsViewProps {
  onCreateTicket: (ticket: Partial<Ticket>) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onCreateTicket }) => {
  const { alerts, loadAlerts, triggerAlert, loading } = useAlerts();
  const toast = useToast();
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCreateTicket = (alert: Alert) => {
     const ticketData: Partial<Ticket> = {
         title: `[NOC Alert] ${alert.device_name}: ${alert.message}`,
         description: `Source: ${alert.source}\nTimestamp: ${new Date(alert.timestamp).toLocaleString()}\nSeverity: ${alert.severity.toUpperCase()}\n\nDevice ${alert.device_name} reported: ${alert.message}. Please investigate immediately.`,
         priority: alert.severity === 'critical' ? TicketPriority.HIGH : TicketPriority.MEDIUM,
         status: TicketStatus.OPEN,
         category: 'hardware' // Default
     };
     onCreateTicket(ticketData);
  };

  const getSeverityVariant = (sev: string): 'destructive' | 'warning' | 'info' => {
      if (sev === 'critical') return 'destructive';
      if (sev === 'warning') return 'warning';
      return 'info';
  };

  const handleSimulateEvent = async () => {
      setIsSimulating(true);
      const scenarios = [
          { device: 'Edge-Router-South', sev: 'critical', msg: 'BGP Session Down (Peer 10.20.1.1)', src: 'BGP Monitor' },
          { device: 'OLT-Cluster-02', sev: 'warning', msg: 'High Temperature Alarm (55°C)', src: 'Hardware Monitor' },
          { device: 'Distribution-Switch-A', sev: 'critical', msg: 'Port Channel 1 Down', src: 'SNMP Trap' },
          { device: 'Access-Point-Corp', sev: 'warning', msg: 'Client Capacity Reached (95%)', src: 'UniFi Controller' },
          { device: 'Core-Firewall', sev: 'info', msg: 'Daily Backup Completed', src: 'System Job' }
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      try {
          await triggerAlert({
              device_name: scenario.device,
              severity: scenario.sev as any,
              message: scenario.msg,
              source: scenario.src,
              timestamp: new Date().toISOString()
          });
          toast.info("New network event detected!");
      } catch (e) {
          toast.error("Failed to simulate event");
      } finally {
          setIsSimulating(false);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Flex justify="between" align="center" className="flex-col sm:flex-row gap-4">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Network Operations Center (NOC)</h2>
                <p className="text-gray-500 text-sm">Real-time infrastructure monitoring events.</p>
            </div>
            <Flex gap={2}>
                <Button variant="secondary" onClick={handleSimulateEvent} isLoading={isSimulating}>
                    <Zap className="w-4 h-4 mr-2 text-amber-500" /> Simulate Event
                </Button>
                <Button variant="outline" onClick={loadAlerts} isLoading={loading}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </Flex>
        </Flex>

        {alerts.length === 0 ? (
            <EmptyState 
                icon={Activity}
                title="No Active Alerts"
                message="Your network infrastructure is running smoothly."
                action={{ label: "Simulate Event", onClick: handleSimulateEvent }}
            />
        ) : (
            <Grid cols={1} gap={4}>
                {alerts.map(alert => (
                    <Card key={alert.id} className="hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary-500">
                        <CardContent className="p-4">
                            <Flex direction="col" justify="between" align="start" gap={4} className="sm:flex-row sm:items-center">
                                <Flex align="center" gap={4}>
                                    <div className={`p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-50' : alert.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                        <Server className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <Flex align="center" gap={2}>
                                            <h3 className="font-semibold text-gray-900">{alert.device_name}</h3>
                                            <Badge variant={getSeverityVariant(alert.severity)} className="capitalize px-1.5 py-0 text-[10px] h-5">{alert.severity}</Badge>
                                        </Flex>
                                        <p className="text-sm text-gray-700 mt-0.5">{alert.message}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            {new Date(alert.timestamp).toLocaleString()} • <span className="font-medium text-gray-500">{alert.source}</span>
                                        </p>
                                    </div>
                                </Flex>

                                <Button size="sm" variant="ghost" className="border border-gray-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200" onClick={() => handleCreateTicket(alert)}>
                                    <TicketIcon className="w-4 h-4 mr-2" />
                                    Create Ticket
                                </Button>
                            </Flex>
                        </CardContent>
                    </Card>
                ))}
            </Grid>
        )}
    </div>
  );
};
