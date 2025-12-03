import React, { useState } from 'react';
import { Alert, Ticket, TicketStatus, TicketPriority } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Server, RefreshCw, ArrowRight, Ticket as TicketIcon } from 'lucide-react';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';

interface AlertsViewProps {
  onCreateTicket: (ticket: Partial<Ticket>) => void;
}

const MOCK_ALERTS: Alert[] = [
    { id: 'ALT-001', device_name: 'Core-Router-01', severity: 'critical', message: 'High CPU Usage (98%)', timestamp: new Date().toISOString(), source: 'Zabbix' },
    { id: 'ALT-002', device_name: 'OLT-North-District', severity: 'warning', message: 'PON Port 3 Signal Low', timestamp: new Date(Date.now() - 3600000).toISOString(), source: 'Huawei NCE' },
    { id: 'ALT-003', device_name: 'Distribution-Switch-B', severity: 'info', message: 'Configuration Saved', timestamp: new Date(Date.now() - 7200000).toISOString(), source: 'Syslog' },
];

export const AlertsView: React.FC<AlertsViewProps> = ({ onCreateTicket }) => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Flex justify="between" align="center">
            <div>
                <p className="text-gray-500">Real-time infrastructure monitoring events.</p>
            </div>
            <Button variant="outline" onClick={() => setAlerts([...MOCK_ALERTS])}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
        </Flex>

        <Grid cols={1} gap={4}>
            {alerts.map(alert => (
                <Card key={alert.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <Flex direction="col" justify="between" align="start" gap={4} className="sm:flex-row sm:items-center">
                            <Flex align="center" gap={4}>
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Server className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{alert.device_name}</h3>
                                    <p className="text-sm text-gray-600">{alert.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(alert.timestamp).toLocaleString()} • Source: {alert.source}
                                    </p>
                                </div>
                            </Flex>

                            <Flex align="center" gap={4}>
                                <Badge variant={getSeverityVariant(alert.severity)} className="capitalize">{alert.severity}</Badge>
                                <Button size="sm" variant="secondary" onClick={() => handleCreateTicket(alert)}>
                                    <TicketIcon className="w-4 h-4 mr-2" />
                                    Create Ticket
                                </Button>
                            </Flex>
                        </Flex>
                    </CardContent>
                </Card>
            ))}
        </Grid>
    </div>
  );
};
