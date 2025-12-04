
import React from 'react';
import { Badge } from './ui/badge';
import { TicketStatus, CustomerStatus, DeviceStatus, InvoiceStatus, EmployeeRole, EmployeeStatus, TicketPriority, InstallationStatus } from '../types';
import { 
  AlertCircle, Clock, CheckCircle2, AlertTriangle, RefreshCw, 
  Briefcase, Headphones, Wrench, Shield, User,
  CheckCircle, Tag, Wifi, CreditCard, Router, HelpCircle,
  UserPlus, Search, HardHat, MapPin
} from 'lucide-react';

export const TicketStatusBadge = ({ status }: { status: TicketStatus }) => {
  const config = {
    [TicketStatus.OPEN]: { style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', icon: AlertCircle },
    [TicketStatus.ASSIGNED]: { style: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800', icon: UserPlus },
    [TicketStatus.IN_PROGRESS]: { style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', icon: Clock },
    [TicketStatus.RESOLVED]: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800', icon: CheckCircle },
    [TicketStatus.VERIFIED]: { style: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800', icon: Search },
    [TicketStatus.CLOSED]: { style: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', icon: CheckCircle2 },
  };
  const { style, icon } = config[status] || config[TicketStatus.OPEN];
  return <Badge className={style} icon={icon}>{(status || 'OPEN').replace('_', ' ').toUpperCase()}</Badge>;
};

export const TicketPriorityBadge = ({ priority }: { priority: TicketPriority }) => {
  const styles = {
    [TicketPriority.LOW]: 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    [TicketPriority.MEDIUM]: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    [TicketPriority.HIGH]: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };
  return <Badge className={styles[priority] || styles[TicketPriority.MEDIUM]}>{(priority || 'MEDIUM').toUpperCase()}</Badge>;
};

export const TicketCategoryBadge = ({ category }: { category: string }) => {
  let Icon = Tag;
  let color = 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const code = (category || '').toLowerCase();

  if (code.includes('internet')) { Icon = Wifi; color = 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'; }
  else if (code.includes('billing')) { Icon = CreditCard; color = 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'; }
  else if (code.includes('hardware')) { Icon = Router; color = 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'; }
  else if (code.includes('install')) { Icon = Wrench; color = 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'; }
  else if (code.includes('other')) { Icon = HelpCircle; }

  const label = category ? category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Uncategorized';

  return <Badge className={color} icon={Icon}>{label}</Badge>;
};

export const TicketCategoryIcon = ({ category }: { category: string }) => {
  let Icon = Tag;
  let color = 'text-gray-600 dark:text-gray-400';
  let bg = 'bg-gray-50 dark:bg-slate-800';
  const code = (category || '').toLowerCase();

  if (code.includes('internet')) { Icon = Wifi; color = 'text-indigo-600 dark:text-indigo-400'; bg = 'bg-indigo-50 dark:bg-indigo-900/20'; }
  else if (code.includes('billing')) { Icon = CreditCard; color = 'text-emerald-600 dark:text-emerald-400'; bg = 'bg-emerald-50 dark:bg-emerald-900/20'; }
  else if (code.includes('hardware')) { Icon = Router; color = 'text-purple-600 dark:text-purple-400'; bg = 'bg-purple-50 dark:bg-purple-900/20'; }
  else if (code.includes('install')) { Icon = Wrench; color = 'text-slate-600 dark:text-slate-400'; bg = 'bg-slate-50 dark:bg-slate-800'; }
  else if (code.includes('other')) { Icon = HelpCircle; }

  return (
    <div className={`p-2 rounded-lg ${bg} ${color} inline-block`}>
      <Icon className="w-6 h-6" />
    </div>
  );
};

export const CustomerStatusBadge = ({ status }: { status: CustomerStatus }) => {
  const styles = {
    [CustomerStatus.LEAD]: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    [CustomerStatus.PENDING]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    [CustomerStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    [CustomerStatus.SUSPENDED]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    [CustomerStatus.CANCELLED]: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };
  return <Badge className={styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>{status ? status.toUpperCase() : 'UNKNOWN'}</Badge>;
};

export const InstallationStatusBadge = ({ status }: { status: InstallationStatus }) => {
  const config = {
    [InstallationStatus.PENDING_SURVEY]: { style: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800', icon: MapPin },
    [InstallationStatus.SURVEY_COMPLETED]: { style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', icon: CheckCircle },
    [InstallationStatus.SURVEY_FAILED]: { style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', icon: AlertTriangle },
    [InstallationStatus.SCHEDULED]: { style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', icon: Clock },
    [InstallationStatus.INSTALLED]: { style: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: HardHat },
  };
  const { style, icon } = config[status] || config[InstallationStatus.PENDING_SURVEY];
  return <Badge className={style} icon={icon}>{status.replace('_', ' ').toUpperCase()}</Badge>;
};

export const DeviceStatusBadge = ({ status }: { status: DeviceStatus }) => {
  const config = {
    [DeviceStatus.ONLINE]: { style: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: CheckCircle },
    [DeviceStatus.OFFLINE]: { style: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', icon: AlertTriangle },
    [DeviceStatus.WARNING]: { style: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', icon: AlertTriangle },
    [DeviceStatus.MAINTENANCE]: { style: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', icon: RefreshCw },
  };
  const { style, icon } = config[status] || config[DeviceStatus.OFFLINE];
  return <Badge className={style} icon={icon}>{status.toUpperCase()}</Badge>;
};

export const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const config = {
    [InvoiceStatus.PAID]: { style: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: CheckCircle2 },
    [InvoiceStatus.PENDING]: { style: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', icon: Clock },
    [InvoiceStatus.OVERDUE]: { style: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', icon: AlertTriangle },
    [InvoiceStatus.CANCELLED]: { style: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', icon: AlertCircle },
  };
  const { style, icon } = config[status];
  return <Badge className={style} icon={icon}>{status.toUpperCase()}</Badge>;
};

export const RoleBadge = ({ role }: { role: EmployeeRole }) => {
  const config = {
    [EmployeeRole.ADMIN]: { style: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800', icon: Shield },
    [EmployeeRole.MANAGER]: { style: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', icon: Briefcase },
    [EmployeeRole.SUPPORT]: { style: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: Headphones },
    [EmployeeRole.TECHNICIAN]: { style: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800', icon: Wrench },
  };
  const { style, icon } = config[role] || { style: 'bg-gray-100 text-gray-800 border-gray-200', icon: User };
  return <Badge className={style} icon={icon}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
};

export const EmployeeStatusBadge = ({ status }: { status: EmployeeStatus }) => {
  const styles = {
    [EmployeeStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    [EmployeeStatus.INACTIVE]: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    [EmployeeStatus.ON_LEAVE]: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  };
  return <Badge className={styles[status]}>{status.replace('_', ' ').toUpperCase()}</Badge>;
};
