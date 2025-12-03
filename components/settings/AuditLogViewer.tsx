
import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, Filter, User, Clock } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLog, AuditAction } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { Flex } from '../ui/flex';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';
import { EmptyState } from '../ui/empty-state';

export const AuditLogViewer: React.FC = () => {
  const { logs, loadLogs, loading } = useAuditLogs();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = 
        log.entity.toLowerCase().includes(search.toLowerCase()) || 
        log.details?.toLowerCase().includes(search.toLowerCase()) ||
        log.performed_by.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionColor = (action: AuditAction) => {
      switch (action) {
          case AuditAction.CREATE: return 'bg-green-100 text-green-800';
          case AuditAction.UPDATE: return 'bg-blue-100 text-blue-800';
          case AuditAction.DELETE: return 'bg-red-100 text-red-800';
          case AuditAction.LOGIN: return 'bg-purple-100 text-purple-800';
          case AuditAction.SYSTEM: return 'bg-gray-100 text-gray-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <Card>
        <CardHeader className="flex-col sm:flex-row justify-between sm:items-center gap-4 py-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 m-0">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Audit Logs
              </h3>
              <p className="text-xs text-gray-500 mt-1">Track system changes and user activity.</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadLogs} isLoading={loading}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
        </CardHeader>

        <CardContent className="p-0">
            <Flex className="p-4 border-b border-gray-100 bg-gray-50 flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter className="h-4 w-4 text-gray-400" /></div>
                    <Input className="pl-10" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                        <option value="all">All Actions</option>
                        <option value={AuditAction.CREATE}>Create</option>
                        <option value={AuditAction.UPDATE}>Update</option>
                        <option value={AuditAction.DELETE}>Delete</option>
                        <option value={AuditAction.LOGIN}>Login</option>
                        <option value={AuditAction.SYSTEM}>System</option>
                    </Select>
                </div>
            </Flex>

            {filteredLogs.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>User</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-xs text-gray-500">
                                    <Flex align="center" gap={1}>
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.created_at).toLocaleString()}
                                    </Flex>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${getActionColor(log.action)} border-0`}>{log.action.toUpperCase()}</Badge>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">{log.entity}</TableCell>
                                <TableCell className="max-w-xs truncate text-gray-600" title={log.details}>{log.details || '-'}</TableCell>
                                <TableCell>
                                    <Flex align="center" gap={1} className="text-xs text-gray-600">
                                        <User className="w-3 h-3" />
                                        {log.performed_by}
                                    </Flex>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="p-8">
                    <EmptyState 
                        icon={FileText}
                        title="No logs found"
                        message="There are no audit logs matching your criteria."
                    />
                </div>
            )}
        </CardContent>
    </Card>
  );
};
