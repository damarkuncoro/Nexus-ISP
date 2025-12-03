import React, { useState } from 'react';
import { Alert, Ticket, TicketStatus, TicketPriority } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Server, RefreshCw, ArrowRight } from 'lucide-react';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';

interface AlertsViewProps {
  onCreateTicket: (ticket: Partial<Ticket>) => void;
}

// Mock Alerts Data Generator
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

  const getSeverityColor = (sev: string) => {
      if (sev === 'critical') return 'bg-red-100 text-red-800 border-red-200';
      if (sev === 'warning') return 'bg-amber-100 text-amber-800 border-amber-200';
      return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Flex justify="between" align="center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">NOC Alerts Dashboard</h2>
                <p className="text-gray-500">Real-time infrastructure monitoring events.</p>
            </div>
            <Button variant="outline" onClick={() => setAlerts([...MOCK_ALERTS])}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
        </Flex>

        <Grid cols={1} gap={4}>
            {alerts.map(alert => (
                <Card key={alert.id} className="hover:shadow-md transition-shadow">
                    <Flex direction="col" justify="between" gap={4} className="p-4 sm:flex-row sm:items-center">
                        <Flex align="start" gap={4}>
                            <div className={`p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <Server className={`w-6 h-6 ${alert.severity === 'critical' ? 'text-red-500' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <Flex align="center" gap={2} className="mb-1">
                                    <h4 className="font-bold text-gray-900">{alert.device_name}</h4>
                                    <Badge className={getSeverityColor(alert.severity)}>
                                        {alert.severity.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-gray-400">{alert.source}</span>
                                </Flex>
                                <p className="text-sm text-gray-600">{alert.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                        </Flex>
                        
                        <Button size="sm" onClick={() => handleCreateTicket(alert)}>
                            Create Ticket <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Flex>
                </Card>
            ))}
            {alerts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No active alerts. Systems normal.
                </div>
            )}
        </Grid>
    </div>
  );
};
